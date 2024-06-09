#include <Arduino.h>
#if defined(ESP32)
  #include <WiFi.h>
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>


#include <TinyGPS++.h>
#include <SoftwareSerial.h>
TinyGPSPlus gps;
SoftwareSerial gpsSerial(D1, D2); // RX, TX
char buffer[100];

//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "Wifi_id"
#define WIFI_PASSWORD "password"

// Insert Firebase project API Key
#define API_KEY "YOUR_API_KEY"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "https://gps-demo-url.firebasedatabase.app/" 

//Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
int count = 0;
bool signupOK = false;

double lat;
double lng;
double altitude;
int year;
int month;
int day;

int hour;
int minute;
int second;

void printData() 
{
    if (gps.location.isUpdated()) {
        lat = gps.location.lat();
        lng = gps.location.lng();

        altitude = gps.altitude.meters();

        // Time UTC
        year = gps.date.year();
        month = gps.date.month();
        day = gps.date.day();

        hour = gps.time.hour();
        minute = gps.time.minute();
        second = gps.time.second();

        snprintf(buffer, sizeof(buffer),
                 "Latitude: %.8f, Longitude: %.8f, Altitude: %.2f m, "
                 "Date/Time: %d-%02d-%02d %02d:%02d:%02d",
                 lat, lng, altitude, year, month, day, hour, minute, second);

        Serial.println(buffer);

  // Set toa do
    if (Firebase.RTDB.setFloat(&fbdo, "GPS/lat", lat)){
      Serial.println("Set lat: " + fbdo.dataPath());
    }
    else {
      Serial.println("FAILED REASON: " + fbdo.errorReason());
    }
    if (Firebase.RTDB.setFloat(&fbdo, "GPS/lng", lng)){
      Serial.println("Set lng: " + fbdo.dataPath());
    }
    else {
      Serial.println("FAILED REASON: " + fbdo.errorReason());
    }

    // Set time
    if (Firebase.RTDB.setFloat(&fbdo, "Time/year", year)){
      Serial.println("Set year: " + fbdo.dataPath());
    }
    if (Firebase.RTDB.setFloat(&fbdo, "Time/month", month)){
      Serial.println("Set month: " + fbdo.dataPath());
    }
    if (Firebase.RTDB.setFloat(&fbdo, "Time/day", day)){
      Serial.println("Set day: " + fbdo.dataPath());
    }
    if (Firebase.RTDB.setFloat(&fbdo, "Time/hour", hour)){
      Serial.println("Set hour: " + fbdo.dataPath());
    }
    if (Firebase.RTDB.setFloat(&fbdo, "Time/minute", minute)){
      Serial.println("Set minute: " + fbdo.dataPath());
    }
 
    }
}

void setup(){
  Serial.begin(9600);
  gpsSerial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("ok");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop(){  
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0) && gpsSerial.available() > 0 && gps.encode(gpsSerial.read())){
    sendDataPrevMillis = millis();
    printData();

  }
}
