// botscript.js

document.getElementById('chatbot-toggle-btn').addEventListener('click', toggleChatbot);
document.getElementById('close-btn').addEventListener('click', toggleChatbot);
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

//Initial welcome message
appendMessage('bot', "<p>Hola 👋<br>Este es el asistente ECOChat<br/>Cómo puedo ayudarte?</p>");

//Function to on-off the popup
function toggleChatbot() {
    const chatbotPopup = document.getElementById('chatbot-popup');
    chatbotPopup.style.display = chatbotPopup.style.display === 'none' ? 'block' : 'none';
}


function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput !== '') {
        appendMessage('user', userInput);
        respondToUser(userInput.toLowerCase());
        document.getElementById('user-input').value = '';
    }
}

function respondToUser(userMessage) {
    var message="";

    chatbox = document.querySelector(".chatbox");

    //The request endpoint of ECOChat API Service
    const API_URL = "https://prod.pangeamt.com:8443/ECOChat/v1/query_assistant";

    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            assistant_name: "your-assistant-name-here",
            apikey: "your-APIKey-here",
            request:  userMessage
        })
    }

    //Before calling the endpoint add the 'waiting' message
    const messageElement=appendMessage("wait", "Esperando la respuesta...."); 

    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        //When the answer is received 
        //load the id from the answer (only needed if later feedback is sent)
        var requestId=JSON.stringify(data.answer.id);

        var refs="";
        //check the references, if any
        if (data.answer.docs[0]!=null) {
            for (var i = 0; i < data.answer.docs.length; i++) {
                var ref = data.answer.docs[i].link;
                const parts = ref.split("?");
                const refTitle = parts[0];
                var sid = data.answer.docs[i].semantic_identifier.replace("\n","").trim();
                var score = data.answer.docs[i].score;
                //load into refs the text of the reference
                refs = refs +  "<a href=\""+ ref +"\">[" + sid +"]</a>";
                }
            //build the final answer with the references    
            message= data.answer.answer.trim().replace("\n","<br/>").replace("\\n","<br/>")+ refs ;
        } else {
            //No references, the final answer is just the text answer
            message= data.answer.answer.trim().replace("\n","<br/>");
        }
        //Change the waiting message to the answer
        changeMessage('bot', message, messageElement);
    }).catch(() => {
        message="Oops! Something failed, try again later.";
        changeMessage('bot', message, messageElement);
    })
}


//function to change text and classes of the answer div
function changeMessage(sender, message, messageElement) {
    const chatBox = document.getElementById('chat-box');
    messageElement.classList.remove('user-message');
    messageElement.classList.remove('bot-message');
    messageElement.classList.remove('wait-message');

    if (sender==="user") {
        messageElement.classList.add('user-message');
    } else if (sender==="bot") {
        messageElement.classList.add('bot-message');
    } else if (sender==="wait") {
        messageElement.classList.add('wait-message');
    }    

    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight+30;
}


//function to create a new bot answer
function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');

    if (sender==="user") {
        messageElement.classList.add('user-message');
    } else if (sender==="bot") {
        messageElement.classList.add('bot-message');
    } else if (sender==="wait") {
        messageElement.classList.add('wait-message');
    }    
    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight+30;
    return(messageElement);
}

