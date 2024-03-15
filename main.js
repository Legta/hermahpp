//Firebase initialization start

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDws9C8vfrS5pSMRHbPnQbsERp6kp206R4",
  authDomain: "hermahs-app.firebaseapp.com",
  projectId: "hermahs-app",
  storageBucket: "hermahs-app.appspot.com",
  messagingSenderId: "635341751247",
  appId: "1:635341751247:web:d1408e8443da6e8e6308ba",
  measurementId: "G-LH8GDM800S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//Firebase initialization end

