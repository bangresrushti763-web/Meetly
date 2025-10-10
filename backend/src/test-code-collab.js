// Simple test to verify code collaboration functionality
import { Server } from "socket.io";
import { createServer } from "node:http";

// Create a simple HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Code Collaboration test server running");
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store shared code
let sharedCode = "// Start coding together...\nfunction hello() {\n  console.log('Hello, Meetly!');\n}";

io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  // Send current code to new user
  socket.emit("init-code", sharedCode);

  // Handle code changes
  socket.on("code-change", (newCode) => {
    console.log("Code updated by user:", socket.id);
    sharedCode = newCode;
    socket.broadcast.emit("update-code", newCode);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Code Collaboration test server running on port ${PORT}`);
  console.log(`Test the code collaboration by connecting to http://localhost:${PORT}`);
});