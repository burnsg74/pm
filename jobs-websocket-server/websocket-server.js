const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Set();

wss.on('connection', ws => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('message', message => {
    console.log(`Received message: ${message}`);
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) { // Send to all EXCEPT the sender
      // if (client.readyState === WebSocket.OPEN) { // To send message back to sender as well, use this line instead
        client.send(`Broadcast: ${message}`); // Prefix the message to indicate it's a broadcast
      }
    });

    //ws.send(`Server received: ${message}`); // Echo back to client
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });

  ws.send('Welcome to WebSocket Server!'); // Send a welcome message on connection
});

console.log('WebSocket server started on port 8080');

