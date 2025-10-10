import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    const connectionDb = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${connectionDb.connection.host}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: "testuser" });
    if (existingUser) {
      console.log("Test user already exists");
      await mongoose.connection.close();
      return;
    }
    
    // Create a test user
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    
    const newUser = new User({
      name: "Test User",
      username: "testuser",
      password: hashedPassword
    });
    
    await newUser.save();
    console.log("Test user created successfully");
    
    // Close connection
    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error:", error);
  }
};

createTestUser();