//Get elements from document
const messageElement = document.getElementById('message-input') 
const sendButton = document.getElementById('send-btn');
const messageColumn = document.getElementById('messages-column');

//Get localStorage if it exists and set the HTML content to it if it does
const previousMessages = localStorage.getItem('savedMessages')? JSON.parse(localStorage.getItem('savedMessages')) : null; 
previousMessages != null ? messageColumn.innerHTML = previousMessages : messageColumn.innerHTML = '';

sendButton.addEventListener('click', submitMessage) //On click event of the send button, call submitMessage

function submitMessage () { //Updates the content of the HTML with the text entered
    if (!messageElement.value) return;
    messageColumn.innerHTML += `
    <div class="pastMessage">
        <p class="small-text">Message ID: ${Date.now()}</p>
        <p>${messageElement.value}</p>
    </div>
    `;
    messageElement.value= '';

    localStorage.setItem('savedMessages', JSON.stringify(messageColumn.innerHTML))    
}


