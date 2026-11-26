const express = require('express');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(data, sender) {
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (socket) => {
  console.log('someone connected');
  socket.on('message', (raw) => {
    broadcast(raw.toString(), socket);
  });
});

server.listen(3000, () => console.log('http://localhost:3000'));