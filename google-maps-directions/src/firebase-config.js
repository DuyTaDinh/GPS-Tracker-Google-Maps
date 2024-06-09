import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database"
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "gps-demo-114a4.firebaseapp.com",
    databaseURL: "https://gps-demo-114a4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gps-demo-114a4",
    storageBucket: "gps-demo-114a4.appspot.com",
    messagingSenderId: "132592517931",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const realtimeDB = getDatabase(app)
