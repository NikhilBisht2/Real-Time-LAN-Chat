// server.js
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http'; // Import createServer for explicit HTTP server
import { Server } from 'socket.io';   // Import Server for Socket.IO

const app = express();
const HTTP_PORT = 8383; // Port for HTTP server (serving index.html)

// Needed to use __dirname with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create an HTTP server explicitly, so Socket.IO can attach to it
const httpServer = createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
const io = new Server(httpServer);

// Middleware
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'chat message' events from clients
  socket.on('chat message', (msg) => {
    console.log(`Received: [${msg.username}]: ${msg.message}`);
    // Broadcast the message to all connected clients
    io.emit('chat message', msg);
  });

  // Listen for disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the HTTP server (which Socket.IO is now attached to)
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP Server and Socket.IO listening on port ${HTTP_PORT}`);
  console.log(`Access chat at http://localhost:${HTTP_PORT}`);
});