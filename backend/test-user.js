import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    // Connect to MongoDB
    const connectionDb = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${connectionDb.connection.host}`);
    
    // Check if there are any users
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database:`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.name})`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error:", error);
  }
};

testConnection();