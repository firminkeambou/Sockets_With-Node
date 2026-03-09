const express = require('express');
const path = require('path');
const api = express();
// We will be using the same server for both the API and the WebSocket server in server.js. Instead of starting the API server here, we will export the api variable and start the server in server.js. This way, we can avoid issues with CORS and have a single entry point for both the API and the WebSocket connections.,this hy we comment out the port
//const PORT = 4000; // Define the port for the API server
//console.log('API', api);
api.use(express.static(path.join(__dirname, 'public')));
api.use('/', express.static(path.join(__dirname, 'public', 'index.html')));
/* api.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
}); */ // We will not be starting the API server here since we are using the same server for both the API and the WebSocket server in server.js. Instead, we will export the api variable and start the server in server.js. we would have kept both the API server and the WebSocket server separate, but for simplicity, we are using the same server for both. This way, we can avoid issues with CORS and have a single entry point for both the API and the WebSocket connections.
module.exports = api;
