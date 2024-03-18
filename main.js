//Firebase initialization start

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth';
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
const auth = getAuth();

//Firebase initialization end

const registerBtn = document.getElementById('signup')
const loginBtn = document.getElementById('signin')
const registerBtnModal = document.getElementById('sign-up-btn');
const loginBtnModal = document.getElementById('sign-in-btn')
const signUpEmail = document.getElementById('email-input')
const signUpPass1 = document.getElementById('password-input1')
const signUpPass2 = document.getElementById('password-input2')
const errorText = document.querySelectorAll('.invalid-email')
const errorTextPass1 = document.querySelectorAll('.invalid-password') 
const errorTextPass2 = document.querySelectorAll('.invalid-password-match') 

registerBtn.addEventListener('click', showSignup)

loginBtn.addEventListener('click', showSignIn)

document.getElementById('email-and-pass').addEventListener('keydown', event => {
  if (event.key !== 'Enter') return;
  if (showErrorsInInput() === false) {
    signUpUser(auth, signUpEmail.value, signUpPass1.value)
  }
})

registerBtnModal.addEventListener('click', (event) => {
  // showErrorsInInput()
  if (showErrorsInInput() === false) {
    signUpUser(auth, signUpEmail.value, signUpPass1.value)
  }
})

function signUpUser (auth, email, password) {
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // console.log(userCredential.user.email)
    signUpEmail.value = '';
    signUpPass1.value = '';
    signUpPass2.value = '';
    const successMessage = document.querySelector('.success-signup');
    successMessage.innerText = `Successfully signed up with email ${userCredential.user.email}!`
    console.log('Signed up! Email: ' + userCredential.user.email)
  })
  .catch(error => {
    console.log(error.code)
    console.log(error.message)
  })
}

function validateEmail (email) {
  const emailValidationRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  return emailValidationRegex.test(email)
}

function showSignIn () {
  const welcomeScreen = document.getElementById('welcome-screen')
  const inModal = document.getElementById('sign-in-modal')
  welcomeScreen.style.display = 'none'
  inModal.style.display = 'flex'
}

function showSignup () {
  const welcomeScreen = document.getElementById('welcome-screen')
  const upModal = document.getElementById('sign-up-modal')
  welcomeScreen.style.display = 'none'
  upModal.style.display = 'flex'
}

function showErrorsInInput () {
  errorText[0].style.display = 'none'
  errorTextPass1[0].style.display = 'none'
  errorTextPass2[0].style.display = 'none'
  if (validateEmail(signUpEmail.value) !== true) return errorText[0].style.display = 'flex';
  if (signUpPass1.value.length < 6 || signUpPass2.value.length < 6) return errorTextPass1[0].style.display = 'flex';
  if (signUpPass1.value !== signUpPass2.value) return errorTextPass2[0].style.display = 'flex';
  return false
}