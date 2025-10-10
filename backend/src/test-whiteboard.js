// Simple test to verify whiteboard socket events
import { Server } from "socket.io";
import { createServer } from "node:http";

// Create a simple server for testing
const app = (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Whiteboard test server");
};

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Whiteboard event listeners
io.on("connection", (socket) => {
  console.log("🖌️ A user connected to whiteboard test");

  socket.on("draw", (data) => {
    console.log("Draw event received:", data);
    socket.broadcast.emit("draw", data); // send to others
  });

  socket.on("clear", () => {
    console.log("Clear event received");
    io.emit("clear");
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected from whiteboard test");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Whiteboard test server running on port ${PORT}`);
});