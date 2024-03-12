//Get elements from document
const messageElement = document.getElementById('message-input') 
const sendButton = document.getElementById('send-btn');
const messageColumn = document.getElementById('messages-column');

//Get localStorage if it exists and set the HTML content to it if it does
const previousMessages = localStorage.getItem('savedMessages')? JSON.parse(localStorage.getItem('savedMessages')) : []; 
previousMessages != [] 
? previousMessages.forEach((el) => messageColumn.innerHTML += el) 
: messageColumn.innerHTML = '';

sendButton.addEventListener('click', submitMessage) //On click event of the send button, call submitMessage

const editButtonsParent = document.getElementById('messages-column'); //Get parent element of the buttons so I can have only one listener instead of one for each button

editButtonsParent.addEventListener('click', (event) => { //Listener that checks if the edit button was clicked and which message it was on
    if (event.target.nodeName !== 'BUTTON') return;
    const targetMessageID = event.target.id.slice(13);
    const newMessage = document.getElementById(`edit-field-${targetMessageID}`)
    editMessage(targetMessageID, newMessage.value)
})

messageElement.addEventListener('keydown', (event) => { //If enter key is pressed while the input is focused, send the message
    if (event.key === 'Enter') {
        submitMessage()
    } 
})

function submitMessage () { //Updates the content of the HTML with the text entered
    if (!messageElement.value) return;
    const messageID = Date.now();
    const newMessageString = `
    <div class="past-message" id="${messageID}">
        <p class="small-text">Message ID: ${messageID}</p>
        <p>${messageElement.value}</p>
        <div class="hover-info">
            <button class="small-text" id="message-edit-${messageID}">Edit</button>
            <input type="text" id="edit-field-${messageID}" autocomplete="off">    
        </div>
    </div>
    `;
    messageColumn.innerHTML += newMessageString;
    previousMessages.push(newMessageString)
    messageElement.value= '';

    localStorage.setItem('savedMessages', JSON.stringify(previousMessages))    
}

function editMessage (messageID, newMessage) {
    const selectedMessage = document.getElementById(`${messageID}`)
    selectedMessage.innerHTML =  `
        <p class="small-text">Message ID: ${messageID}</p>
        <p>${newMessage}</p>
        <div class="hover-info">
            <button class="small-text" id="message-edit-${messageID}">Edit</button>
            <input type="text" id="edit-field-${messageID}" autocomplete="off">    
        </div>
    `;
}

