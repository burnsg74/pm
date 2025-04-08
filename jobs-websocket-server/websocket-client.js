const WebSocket = require('ws');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ws = new WebSocket('ws://localhost:8080'); // Replace with your WebSocket server URL if different

ws.on('open', () => {
  console.log('WebSocket client connected');
  sendMessagePrompt(); // Start prompting for messages after connection is open
});

ws.on('message', message => {
  console.log(`Received message from server: ${message}`);
  sendMessagePrompt(); // Prompt for the next message after receiving a message
});

ws.on('close', () => {
  console.log('WebSocket client disconnected');
  readline.close();
});

ws.on('error', error => {
  console.error('WebSocket client error:', error);
  readline.close();
});

function sendMessage(message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    console.log('WebSocket is not open, message not sent.');
  }
}

function sendMessagePrompt() {
  readline.question('Enter message to send to server (or type "exit" to quit): ', message => {
    if (message.toLowerCase() === 'exit') {
      ws.close(); // Close the WebSocket connection
      readline.close(); // Close the readline interface
    } else {
      console.log('Sending: ',message);
      sendMessage(message); // Send the message to the server
      // No need to prompt again here, prompt will happen after receiving server response or in the next iteration
    }
  });
}

