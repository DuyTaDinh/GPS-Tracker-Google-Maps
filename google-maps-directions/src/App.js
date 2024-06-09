import {
    Box,
    Button,
    Flex,
    HStack,
    Input,
    SkeletonText,
    Text,
} from '@chakra-ui/react'
import {FaLocationArrow, FaTimes} from 'react-icons/fa'
import Clock from 'react-live-clock';
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    Autocomplete,
    DirectionsRenderer,
} from '@react-google-maps/api'
import React, {useRef, useState, useEffect} from "react"
import {realtimeDB} from './firebase-config';
import {getDatabase,ref,onValue} from "firebase/database"

const center = {lat: 21.026560, lng: 105.836200}
const libraries = ['places'];

function App() {

    useEffect(() => {
        onValue(dbLat,snapshot => {
            setLatitude(snapshot.val());
        })
        onValue(dbLng,snapshot => {
            setLongitude(snapshot.val());
        })
    }, [])

    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    })

    const [map, setMap] = useState(/** @type google.maps.Map */ (null))
    const [directionsResponse, setDirectionsResponse] = useState(null)
    const [distance, setDistance] = useState('')
    const [duration, setDuration] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    // const [test, setTest] = useState('12:11 11/28/2022')

    const dbLat = ref(realtimeDB,"GPS/lat");
    const dbLng = ref(realtimeDB,"GPS/lng");

    /** @type React.MutableRefObject<HTMLInputElement> */
    const originRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const destiantionRef = useRef()

    if (!isLoaded) {
        return <SkeletonText/>
    }

    async function calculateRoute() {
        if (originRef.current.value === '' || destiantionRef.current.value === '') {
            return
        }
        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService()
        const results = await directionsService.route({
            // eslint-disable-next-line no-undef
            origin: originRef.current.value === 'MyPos' ? new google.maps.LatLng(latitude, longitude) : originRef.current.value,
            destination: destiantionRef.current.value,
            // eslint-disable-next-line no-undef
            travelMode: google.maps.TravelMode.DRIVING,
        })
        setDirectionsResponse(results)
        setDistance(results.routes[0].legs[0].distance.text)
        setDuration(results.routes[0].legs[0].duration.text)
    }

    function clearRoute() {
        setDirectionsResponse(null)
        setDistance('')
        setDuration('')
        originRef.current.value = ''
        destiantionRef.current.value = ''
    }

    return (
        <Flex
            position='relative'
            flexDirection='column'
            alignItems='center'
            h='100vh'
            w='100vw'
        >
            <Box position='absolute' left={0} top={0} h='100%' w='100%'>
                {/* Google Map Box */}
                <GoogleMap
                    center={center}
                    zoom={15}
                    mapContainerStyle={{width: '100%', height: '100%'}}
                    options={{
                        zoomControl: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                    onLoad={map => setMap(map)}
                >
                    <Marker position={center}/>
                    {directionsResponse && (
                        <DirectionsRenderer directions={directionsResponse}/>
                    )}
                </GoogleMap>
            </Box>
            <Box
                p={6}
                borderRadius='lg'
                m={4}
                bgColor='white'
                shadow='base'
                minW='container.md'
                zIndex='1'
            >
                <HStack justifyContent='space-between'>
                    <Text>Enter "MyPos" in "Origin" to calculate route from current location</Text>
                    <Clock format={'HH:mm:ss'} ticking={true} timezone={'Asia/Ho_Chi_Minh'} />
                </HStack>
                <HStack spacing={2} justifyContent='space-between'>
                    <Box flexGrow={1}>
                        <Autocomplete>
                            <Input type='text' placeholder='Origin' ref={originRef}/>
                        </Autocomplete>
                    </Box>
                    <Box flexGrow={1}>
                        <Autocomplete>
                            <Input type='text' placeholder='Destination' ref={destiantionRef}/>
                        </Autocomplete>
                    </Box>
                    <Button colorScheme='pink' type='submit' style={{height: '40px', width : '145px'}} onClick={calculateRoute}>
                        Calculate Route
                    </Button>
                </HStack>
                <HStack spacing={2} mt={2} justifyContent='space-between'>
                    <Text>Distance: {distance} </Text>
                    <Text>Duration: {duration} </Text>
                    <Button colorScheme='red' type='submit' style={{height: '40px', width : '145px'}} onClick={clearRoute}>
                        Clear
                    </Button>
                </HStack>

                <HStack spacing={2} mt={2} justifyContent='space-between'>
                    <Text>My Current Position: </Text>
                    <Text>Latitude: {latitude} </Text>
                    <Text>Longitude: {longitude} </Text>
                </HStack>

            </Box>
        </Flex>
    )
}

export default App
