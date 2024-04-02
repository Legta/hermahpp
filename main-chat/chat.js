//Firebase initialization start

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, addDoc, getDocs, collection, query, orderBy, onSnapshot, limitToLast, endBefore, where, doc, updateDoc, serverTimestamp } from "firebase/firestore"
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
const db = getFirestore(app)

//Firebase initialization end

//Check if user is logged in, if not, redirect to homepage
auth.onAuthStateChanged(async user => {
    if (user) {
        if (user.emailVerified) {
            //Get elements from document
            const messageElement = document.getElementById('message-input')
            const sendButton = document.getElementById('send-btn');
            const messageColumn = document.getElementById('messages-column');
            const userEmailElement = document.getElementById('user-email');
            const logoutBtn = document.getElementById('logout-btn');
            const username = user.displayName;

            const notificationSound = new Audio('../assets/audio/notification.wav')
            notificationSound.volume = 0.3;


            const orderQuery = query(collection(db, 'messages'), orderBy('id'), limitToLast(25))
            let firstFetch = true;
            const onStartupFetcher = onSnapshot(orderQuery, (snapshot) => {
                const docsArray = snapshot.docs
                if (firstFetch === true) {
                    try {
                        docsArray.forEach(el => messageColumn.innerHTML += el.data().HTMLcontent);
                        ownMessageDisplay()
                        scrollToBottom()
                    } catch (error) {
                        console.error(error)
                    } finally {
                        firstFetch = false;
                    }
                } else {
                    try {
                        const newMsgQuery = query(collection(db, 'messages'), orderBy('id'), limitToLast(1))
                        const newMessageFetcher = onSnapshot(newMsgQuery, (snapshotNewFetch) => {
                            if (snapshotNewFetch.docs[0].data().edited === true) {
                                
                                return newMessageFetcher()
                            }
                            messageColumn.innerHTML += snapshotNewFetch.docs[0].data().HTMLcontent
                            ownMessageDisplay()
                            scrollToBottom()
                            if (!document.hasFocus()) {
                                document.title = '(*) Hermahs App'
                                notificationSound.play()
                            }
                            newMessageFetcher()
                        });
                    }
                    catch (error) {
                        console.error(error)
                    }
                }
            })

            window.onfocus = () => {
                if (document.title !== 'Hermahs App') document.title = 'Hermahs App'
            }

            //Functions for scrolling and throttle

            const throttle = (callback, wait) => { //This function prevents whatever function provided to it as an argument from running immediately after, instead only running it if the timer is null, which it only is after the previous settimeout has ended. For more info look up throttling on Javascript
                let timeoutId = null;
                return (...args) => {
                    if (timeoutId === null) {
                        callback(...args)
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => {
                            timeoutId = null
                        }, wait);
                    }
                };
            }

            const loadNewMessagesAtTop =
                throttle((delimited = delimiterMessage) => { //calls the throttle function with the actual intended code of the function as the first parameter and the time to wait in ms as the second paramater
                    const infiniteLoadQuery = query(collection(db, 'messages'), orderBy('id', 'asc'), limitToLast(25), endBefore(delimited))
                    messageColumn.innerHTML = `<p id="loading-text-scroll" style="align-self:center;">Loading...</p>` + messageColumn.innerHTML
                    getDocs(infiniteLoadQuery).then((snapshot) => {
                        try {
                            document.getElementById('loading-text-scroll').remove()
                            snapshot.docs.reverse().forEach((el) => {
                                messageColumn.innerHTML = el.data().HTMLcontent + messageColumn.innerHTML
                            })
                            console.log('Retrieved messages from infinite scroll')
                            ownMessageDisplay()
                            delimiterMessage = snapshot.docs[0]
                        } catch (error) {
                            console.error(error)
                        }
                    })
                }, 2500);

            // -------------------------------------

            window.addEventListener('scroll', (__event) => {
                if (window.scrollY == 0) {
                    loadNewMessagesAtTop(delimiterMessage)
                }


            })

            window.onload = scroll(0, document.body.scrollHeight) //Scrolls to the very bottom on page load   

            userEmailElement.innerText = `Logged in as ${user.displayName}`;

            logoutBtn.addEventListener('click', event => {
                signOut(auth)
                return redirectUser()
            })

            sendButton.addEventListener('click', submitMessageText) //On click event of the send button, call submitMessage

            messageElement.addEventListener('keydown', (event) => { //If enter key is pressed while the input is focused, send the message
                if (event.key === 'Enter') submitMessageText()
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

            async function submitMessageText() { //Updates the content of the HTML with the text entered
                if (!messageElement.value) return;
                const messageID = Date.now();
                const newMessageString = `
                <div class="past-message ${user.uid}" id="${messageID}">
                <p class="small-text">${username} dice:</p>
                <p>${messageElement.value}</p>
                <div class="hover-info ${user.uid}">
                <button class="small-text" id="message-edit-${messageID}">Edit</button>
                <button class="small-text" id="message-delete-${messageID}">Delete</button>
                <input class="hidden-input" type="text" id="edit-field-${messageID}" placeholder="Press enter to confirm edit" autocomplete="off">    
                </div>
                </div>
                `;

                addToDB({
                    id: messageID,
                    authorID: user.uid,
                    authorEmail: user.email,
                    authorDisplayName: user.displayName ? user.displayName : '',
                    type: 'text',
                    HTMLcontent: newMessageString,
                    content: messageElement.value,
                    edited: false
                })
                messageElement.value = '';
                scrollToBottom()
            }


            function ownMessageDisplay() {
                const ownMessages = document.querySelectorAll(`.${CSS.escape(user.uid)}`)
                const ownMessagesEditDiv = document.querySelectorAll(`.hover-info.${CSS.escape(user.uid)}`)
                const ownMessagesUsernameDisplay = document.querySelectorAll(`.past-message.${CSS.escape(user.uid)} p.small-text`)
                ownMessages.forEach(el => {
                    el.style.alignSelf = 'flex-end'
                    el.style.backgroundColor = 'lightblue'
                })
                ownMessagesEditDiv.forEach(el => {
                    el.style.display = 'flex'
                    el.style.alignSelf = 'center'
                })
                ownMessagesUsernameDisplay.forEach(el => {
                    el.style.alignSelf = 'flex-end'
                })
            }

            function editMessage(messageID, newMessage) {
                let messageDocID = '';
                const editQuery = query(collection(db, 'messages'), where('id', '==', parseInt(messageID)))
                getDocs(editQuery).then((snapshot) => {
                    messageDocID = snapshot.docs[0].id
                    const retrievedDocRef = doc(collection(db, 'messages'), messageDocID)
                    updateDoc(retrievedDocRef, {
                        HTMLcontent: `
                    <div class="past-message ${user.uid}" id="${messageID}">
                <p class="small-text">(Edited)\n ${username} dice:</p>
                <p>${newMessage}</p>
                <div class="hover-info ${user.uid}">
                <button class="small-text" id="message-edit-${messageID}">Edit</button>
                <button class="small-text" id="message-delete-${messageID}">Delete</button>
                <input class="hidden-input" type="text" id="edit-field-${messageID}" placeholder="Press enter to confirm edit" autocomplete="off">    
                </div>
                </div>
                    `, 
                content: newMessage,
                edited: true
            })
                console.log('Updated message')
                })
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

            function scrollToBottom() {
                // Use setTimeout to allow DOM updates before scrolling
                setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
                }, 0);
            }

            async function addToDB(data) {
                const messagesCollection = collection(db, 'messages')
                try {
                    await addDoc(messagesCollection, data)
                } catch (error) {
                    console.error('Error adding data: ', error)
                }
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
