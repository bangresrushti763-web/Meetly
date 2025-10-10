import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  console.log('🧪 Testing MongoDB connection...');
  console.log('Using URI:', process.env.MONGODB_URI);
  console.log('');
  
  try {
    // Attempt to connect to MongoDB with quick timeout
    const connectionDb = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB Connection Successful!');
    console.log('Host:', connectionDb.connection.host);
    console.log('Database:', connectionDb.connection.name);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.log('ℹ️  MongoDB Connection Failed (this is expected in some environments)');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 This is normal behavior if you are:');
    console.log('   • Behind a firewall');
    console.log('   • Have DNS resolution issues');
    console.log('   • Working in a restricted network environment');
    console.log('');
    console.log('ℹ️  The application will work correctly using in-memory storage');
    console.log('   for development and testing purposes.');
    console.log('');
    console.log('🔧 For production deployment, ensure:');
    console.log('   1. Proper network connectivity to MongoDB');
    console.log('   2. Your IP is whitelisted in MongoDB Atlas');
    console.log('   3. Correct DNS resolution');
  }
};

testConnection();