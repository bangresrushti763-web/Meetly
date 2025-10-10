import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import meetingNotesRoutes from "./routes/meetingNotes.routes.js";
import translateRoutes from "./routes/translate.routes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000)
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/meeting-notes", meetingNotesRoutes);
app.use("/api/v1/translate", translateRoutes);

// Test route to check if server is running
app.get("/api/v1/test", (req, res) => {
    res.json({ message: "Server is running" });
});

const start = async () => {
    console.log("Attempting to connect to MongoDB with URI:", process.env.MONGODB_URI?.split('?')[0]); // Hide sensitive params
    
    try {
        // Enhanced connection options for better reliability in restricted environments
        const connectionOptions = {
            serverSelectionTimeoutMS: 5000, // Reduced timeout to 5s for faster failure
            socketTimeoutMS: 10000,
            connectTimeoutMS: 5000,
            family: 4, // Use IPv4, which is more reliable
            tls: false, // Disable TLS for local connections
            retryWrites: true,
            w: "majority",
            maxPoolSize: 5, // Limit connection pool size
            heartbeatFrequencyMS: 10000, // Check connection health every 10s
            autoIndex: true
        };
        
        // Try connecting with the enhanced options
        const connectionDb = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
        console.log(`✅ MONGO Connected Successfully! DB Host: ${connectionDb.connection.host}`)
        console.log(`📊 Database: Using MongoDB (${connectionDb.connection.name})`);
    } catch (error) {
        console.log("⚠️  MongoDB connection failed:");
        console.log("   Error Code:", error.code);
        console.log("   Error Message:", error.message);
        
        // More specific error handling
        if (error.code === 'ENOTFOUND') {
            console.log("   🔍 DNS Resolution Issue Detected");
            console.log("   💡 Possible causes:");
            console.log("      • Incorrect MongoDB URI hostname");
            console.log("      • Network connectivity issues");
            console.log("      • DNS resolution problems");
            console.log("      • Firewall blocking DNS requests");
        } else if (error.code === 'ECONNREFUSED') {
            console.log("   🔍 Connection Refused Issue Detected");
            console.log("   💡 Possible causes:");
            console.log("      • MongoDB service is down");
            console.log("      • Network connectivity issues");
            console.log("      • Firewall blocking connection");
        }
        
        console.log("ℹ️  Using in-memory storage for testing - this is normal behavior in development");
        console.log("💡 For production deployment, ensure proper network connectivity to MongoDB");
        
        // Log the full error for debugging only in development
        if (process.env.NODE_ENV !== 'production') {
            console.debug("Full error details:", error);
        }
    }
    
    server.listen(app.get("port"), () => {
        console.log("🚀 LISTENING ON PORT", app.get("port"))
        console.log("🔧 Server running in", process.env.NODE_ENV || "development", "mode");
        
        // Check if we're using MongoDB or fallback
        mongoose.connection.readyState === 1 
            ? console.log("📊 Database: Connected to MongoDB") 
            : console.log("📊 Database: Using in-memory storage (MongoDB fallback active)");
    });
}

start();