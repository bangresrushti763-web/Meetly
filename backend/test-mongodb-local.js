import mongoose from 'mongoose';

// Test connection to local MongoDB
async function testConnection() {
  try {
    console.log('Attempting to connect to local MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/meetly');
    console.log('Successfully connected to local MongoDB!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Failed to connect to local MongoDB:', error.message);
  }
}

testConnection();