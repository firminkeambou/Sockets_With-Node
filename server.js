const fs = require('fs'); // to read SSL certificate files
const path = require('path'); // to handle file paths
const http = require('http'); // to create an HTTP server
const io = require('socket.io'); // to handle WebSocket connections

// // to create a secure server
//const https = require('https');
const httpServer = http
  .createServer
  /*apiServer {
  key: fs.readFileSync(path.join(__dirname, 'keys', 'private_key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'keys', 'public_certificate.pem')),
} */
  (); // here api(express) is being passed as a request handler to the server, so that the same server can handle both API requests and WebSocket connections. This way, we can avoid issues with CORS and have a single entry point for both the API and the WebSocket connections.
//const express = require('express'); // web framework for Node.js
// instead of express, socket is being used here
const socketServer = io(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    //credentials: true, // Crucial if your app uses cookies or auth headers
  },
});
const sockets = require('./sockets'); // Import the listen function from sockets.js
const PORT = 8200; // Define the port for the secure server
httpServer.listen(PORT, () => {
  console.log(`Secure websocket server on http://localhost:${PORT}`);
});
sockets.listen(socketServer); // Start listening for WebSocket connections using the listen function from sockets.js

//let players = []; // to keep track of connected players
