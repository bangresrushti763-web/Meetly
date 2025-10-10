// Simple test to verify whiteboard functionality without OpenAI dependencies
import { Server } from "socket.io";
import { createServer } from "node:http";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Create a simple HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Whiteboard test server running");
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Whiteboard event listeners
io.on("connection", (socket) => {
  console.log("🖌️ A user connected to whiteboard");

  // Handle drawing events
  socket.on("draw", (data) => {
    console.log("Draw event received:", data);
    // Broadcast to all other connected clients
    socket.broadcast.emit("draw", data);
  });

  // Handle clear events
  socket.on("clear", () => {
    console.log("Clear event received");
    // Broadcast to all connected clients
    io.emit("clear");
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected from whiteboard");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Whiteboard test server running on port ${PORT}`);
  console.log(`Test the whiteboard by connecting to http://localhost:${PORT}`);
});