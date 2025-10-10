// Simple test to verify meeting tracker functionality
import { Server } from "socket.io";
import { createServer } from "node:http";

// Create a simple HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Meeting Tracker test server running");
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store speaking times for meeting productivity tracking
let userSpeakingTimes = {};

io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  // Start speaking
  socket.on("start-speaking", (userId) => {
    console.log(`User ${userId} started speaking`);
    userSpeakingTimes[userId] = userSpeakingTimes[userId] || { total: 0, start: null };
    userSpeakingTimes[userId].start = Date.now();
    io.emit("update-times", userSpeakingTimes);
  });

  // Stop speaking
  socket.on("stop-speaking", (userId) => {
    console.log(`User ${userId} stopped speaking`);
    const record = userSpeakingTimes[userId];
    if (record && record.start) {
      record.total += Date.now() - record.start;
      record.start = null;
    }
    io.emit("update-times", userSpeakingTimes);
  });

  // Disconnect cleanup
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`Meeting Tracker test server running on port ${PORT}`);
  console.log(`Test the meeting tracker by connecting to http://localhost:${PORT}`);
});