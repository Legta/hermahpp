//Firebase initialization start

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signOut } from "firebase/auth";
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


//Check if user is logged in, if not, redirect to homepage
auth.onAuthStateChanged(user => {
    if (user) {
        if (user.emailVerified) {
            //Get elements from document
            const messageElement = document.getElementById('message-input')
            const sendButton = document.getElementById('send-btn');
            const messageColumn = document.getElementById('messages-column');
            const userEmailElement = document.getElementById('user-email');
            const logoutBtn = document.getElementById('logout-btn');

            //Get localStorage if it exists and set the HTML content to it if it does
            const previousMessages = localStorage.getItem('savedMessages') ? JSON.parse(localStorage.getItem('savedMessages')) : [];
            previousMessages != []
                ? previousMessages.forEach((el) => messageColumn.innerHTML += el)
                : messageColumn.innerHTML = '';
            window.onload = scroll(0, document.body.scrollHeight) //Scrolls to the very bottom on page load

            userEmailElement.innerText = `Logged in as ${user.email}`;

            logoutBtn.addEventListener('click', event => {
                signOut(auth)
                return redirectUser()
            })

            sendButton.addEventListener('click', submitMessage) //On click event of the send button, call submitMessage

            messageElement.addEventListener('keydown', (event) => { //If enter key is pressed while the input is focused, send the message
                if (event.key === 'Enter') submitMessage()
            })

            const editButtonsParent = document.getElementById('messages-column'); //Get parent element of the buttons so I can have only one listener instead of one for each button

            editButtonsParent.addEventListener('click', (event) => { //Listener that checks if the edit button was clicked and toggles the text field on and off
                if (event.target.nodeName !== 'BUTTON') return;
                if (event.target.id.startsWith('message-edit')) {
                    if (event.target.display === 'none') event.target.style.display = 'block';
                    const targetMessageID = event.target.id.slice(13);
                    const newMessage = document.getElementById(`edit-field-${targetMessageID}`)
                    return showEditInput(newMessage, event)
                }
                if (event.target.id.startsWith('close-edit')) {
                    const targetMessageID = event.target.id.slice(11);
                    const newMessage = document.getElementById(`edit-field-${targetMessageID}`)
                    return closeEditInput(newMessage, event)
                }
                if (event.target.id.startsWith('message-delete')) deleteMessage(event.target.id.slice(15));
            })

            editButtonsParent.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && event.target.id.startsWith('edit-field')) {
                    const selectedMessageID = event.target.id.slice(11)
                    editMessage(selectedMessageID, event.target.value)
                }
            })



            function submitMessage() { //Updates the content of the HTML with the text entered
                if (!messageElement.value) return;
                const messageID = Date.now();
                const newMessageString = `
    <div class="past-message" id="${messageID}">
        <p class="small-text">Message ID: ${messageID}</p>
        <p>${messageElement.value}</p>
        <div class="hover-info">
            <button class="small-text" id="message-edit-${messageID}">Edit</button>
            <button class="small-text" id="message-delete-${messageID}">Delete</button>
            <input class="hidden-input" type="text" id="edit-field-${messageID}" placeholder="Press enter to confirm edit" autocomplete="off">    
        </div>
    </div>
    `;
                messageColumn.innerHTML += newMessageString;
                previousMessages.push(newMessageString)
                messageElement.value = '';

                localStorage.setItem('savedMessages', JSON.stringify(previousMessages))

                scrollToBottom()
            }

            function editMessage(messageID, newMessage) {
                const selectedMessage = document.getElementById(`${messageID}`)
                selectedMessage.innerHTML = `
        <p class="small-text">Message ID: ${messageID}</p>
        <p class="small-text">(Edited)</p>
        <p>${newMessage}</p>
        <div class="hover-info">
            <button class="small-text" id="message-edit-${messageID}">Edit</button>
            <button class="small-text" id="message-delete-${messageID}">Delete</button>
            <input class="hidden-input" type="text" id="edit-field-${messageID}" placeholder="Press enter to confirm edit" autocomplete="off">    
        </div>
    `;

                replaceItemInLocalStorage(messageID, selectedMessage.innerHTML)
            }

            function showEditInput(field, buttonEvent) {
                field.style.display = 'block';
                buttonEvent.target.innerText = 'Close'
                buttonEvent.target.id = buttonEvent.target.id.replace('message-edit', 'close-edit')
            }

            function closeEditInput(field, buttonEvent) {
                field.style.display = 'none';
                buttonEvent.target.innerText = 'Edit'
                buttonEvent.target.id = buttonEvent.target.id.replace('close-edit', 'message-edit')
            }

            function findLocalStorageItemIndex(storageArray, htmlID) {
                const regex = new RegExp(htmlID)
                return storageArray.findIndex((el) => el.match(regex))
            }

            function replaceItemInLocalStorage(messageID, newItem) {
                const itemIndex = findLocalStorageItemIndex(previousMessages, messageID)
                previousMessages[itemIndex] = `
        <div class="past-message" id="${messageID}">
            ${newItem}
        </div>
    `
                localStorage.setItem('savedMessages', JSON.stringify(previousMessages))
            }

            function deleteMessage(messageID) {
                const selectedMessage = document.getElementById(`${messageID}`)
                previousMessages.splice(findLocalStorageItemIndex(previousMessages, messageID), 1)
                localStorage.setItem('savedMessages', JSON.stringify(previousMessages))
                return selectedMessage.remove()
            }

            function scrollToBottom() {
                // Use setTimeout to allow DOM updates before scrolling
                setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
                }, 0);
            }
        }
        else {
            alert('Your email is unverified. Returning to homepage...')
            redirectUser()
        }
    } else {
        alert('Logged out! Returning to homepage...')
        redirectUser()
    }
})

function redirectUser() {
    window.location.href = '../index.html'
}
