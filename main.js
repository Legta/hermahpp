//Firebase initialization start

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, updateProfile, sendPasswordResetEmail, confirmPasswordReset} from 'firebase/auth';
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

const loadingScreen = document.getElementById('loading-screen');
auth.onAuthStateChanged( async user => { //check if user is logged in on load
  if (user) {
    loadingScreen.innerHTML = `<p>Logged in as ${user.email}!</p>`
    if (!user.emailVerified) {
      loadingScreen.innerHTML = `<p>Logged in as ${user.email}, ${user.displayName}!<br>Email has not been verified</p>
      <button id="logoutbtn" type="button">Log out</button>`

      document.getElementById('logoutbtn').addEventListener('click', event => signOut(auth))
    } else if (user.emailVerified) {
      loadingScreen.innerHTML = `<p>Logged in as ${user.email}!<br>Redirecting to the chat...</p>`
      redirectUser()
    }
  } 
  else {

    //Sign up flow implementation start
    const welcomeScreen = document.getElementById('welcome-screen')
    const registerBtn = document.getElementById('signup')
    const registerBtnModal = document.getElementById('sign-up-btn');
    const signUpEmail = document.getElementById('email-input')
    const signUpPass1 = document.getElementById('password-input1')
    const signUpPass2 = document.getElementById('password-input2')
    const errorText = document.querySelectorAll('.invalid-email')
    const errorTextPass1 = document.querySelectorAll('.invalid-password') 
    const errorTextPass2 = document.querySelectorAll('.invalid-password-match') 
    const usernameInput = document.getElementById('username-input')

  loadingScreen.style.display ='none'
  welcomeScreen.style.display= 'flex'

  registerBtn.addEventListener('click', showSignup)

  document.getElementById('email-and-pass').addEventListener('keydown', async event => {
    if (event.key !== 'Enter') return;
    if (showErrorsInInputSignUp() === false) {
      await signUpUser(auth, signUpEmail.value, signUpPass1.value);
      auth.onAuthStateChanged( async (userNew) => {
        await updateProfile(userNew, {displayName: usernameInput.value});
      })
    }
  })

  registerBtnModal.addEventListener('click', (event) => {
    if (showErrorsInInputSignUp() === false) {
      signUpUser(auth, signUpEmail.value, signUpPass1.value, usernameInput.value)
    }
  })

  async function signUpUser (auth, email, password) {
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      signUpEmail.value = '';
      signUpPass1.value = '';
      signUpPass2.value = '';
      const successMessage = document.querySelector('.success-signup');
      successMessage.innerText = `Successfully signed up with email ${userCredential.user.email}!\nAn email has been sent to your address to verify it and complete the registration process`
      console.log('Signed up! Email: ' + userCredential.user.email)
      auth.onAuthStateChanged(async newUser => {
        await sendEmailVerification(newUser)
      })
      // return userCredential.user
    })
    .catch(error => {
      console.log(error.code)
      console.log(error.message)
      if (error.code === 'auth/email-already-in-use') {
        errorTextPass2[0].style.display = 'flex'
        errorTextPass2[0].innerText = 'Email is already in use.'
      }
    })
  }

  function validateEmail (email) {
    const emailValidationRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    return emailValidationRegex.test(email)
  }

  function showSignup () {
    const upModal = document.getElementById('sign-up-modal')
    welcomeScreen.style.display = 'none'
    upModal.style.display = 'flex'
  }

  function showErrorsInInputSignUp () {
    errorText[0].style.display = 'none'
    errorTextPass1[0].style.display = 'none'
    errorTextPass2[0].style.display = 'none'
    if (validateEmail(signUpEmail.value) !== true) return errorText[0].style.display = 'flex';
    if (signUpPass1.value.length < 6 || signUpPass2.value.length < 6) return errorTextPass1[0].style.display = 'flex';
    if (signUpPass1.value !== signUpPass2.value) return errorTextPass2[0].style.display = 'flex';
    return false
  }

  //Sign up implementation end
/* --------------------------------------------------------------------------------------------------------- */
  //Sign in implementation start

  const loginBtn = document.getElementById('signin')
  const loginBtnModal = document.getElementById('sign-in-btn')
  const loginModal = document.getElementById('sign-in-modal')
  const loginEmail = document.getElementById('email-input-in')
  const loginPassword = document.getElementById('password-signin')
  const errorTextLogin = document.querySelector('.invalid-email-login')
  const errorTextPassLogin = document.querySelector('.invalid-password-login')
  const forgottenPassText = document.querySelector('#email-and-pass-in a')
  const forgottenPasswordDiv = document.getElementById('forgottenpass')
  const forgottenPasswordButton = document.getElementById('submit-email-btn')
  const forgottenPasswordEmail = document.getElementById('forgottenemail')

  loginBtn.addEventListener('click', showSignIn)

  forgottenPassText.addEventListener('click', (event) => {
    loginModal.style.display = 'none'
    forgottenPasswordDiv.style.display = 'block'
  })

  forgottenPasswordButton.addEventListener('click', event => {
    sendPasswordResetEmail(auth, forgottenPasswordEmail.value)
    forgottenPasswordDiv.innerHTML = `
    <p style="color:green">An email has been sent to ${forgottenPasswordEmail.value} with a link to reset your password. Once you have done so just refresh the page and try your new password!</p>`
  })



  loginBtnModal.addEventListener('click', event => {
    if (areInputsCorrectSignIn() === true) {
      signInUser(auth, loginEmail.value, loginPassword.value)
    }
  })

  document.getElementById('email-and-pass-in').addEventListener('keydown', key => {
    if (key.key !== 'Enter') return;
    if (areInputsCorrectSignIn() === true) {
      signInUser(auth, loginEmail.value, loginPassword.value)
    }
  })

  function signInUser (auth, email, password) {
    signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      if (userCredential.user.emailVerified) {
        errorTextPassLogin.style.display = 'flex'
        errorTextPassLogin.style.color = 'green';
        errorTextPassLogin.innerText = 'Logged in successfully! Redirecting...'
        redirectUser()
      } else {
          errorTextPassLogin.style.display = 'flex'
          errorTextPassLogin.innerText = 'Logged in correctly. You need to verify your email address!'
        }
      // const user = userCredential.user
      // console.log(user)
    })
    .catch (error => {
      console.log(error.code)
      console.log(error.message)
      if (error.code === 'auth/invalid-credential') {
        errorTextPassLogin.style.display = 'flex'
        errorTextPassLogin.innerText = 'Invalid credentials!'
      }
    })
  }

  function showSignIn () {
    const welcomeScreen = document.getElementById('welcome-screen')
    const inModal = document.getElementById('sign-in-modal')
    welcomeScreen.style.display = 'none'
    inModal.style.display = 'flex'
  }

  function areInputsCorrectSignIn () {
    errorTextLogin.style.display = 'none'
    errorTextPassLogin.style.display = 'none'
    errorTextPassLogin.innerText = 'Enter a password'
    if (validateEmail(loginEmail.value) !== true) return errorTextLogin.style.display = 'flex';
    if (!loginPassword.value) return errorTextPassLogin.style.display = 'flex';
    return true
  }

  //Sign in implementation end
  }
})

function redirectUser() {
  return window.location.href = 'main-chat/index.html'
}