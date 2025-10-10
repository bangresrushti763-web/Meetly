import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing MongoDB connection with various approaches...\n');

// Test 1: Standard connection
console.log('Test 1: Standard connection');
try {
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 5000,
    family: 4,
    tls: true
  });
  console.log('✅ Standard connection successful');
  await mongoose.connection.close();
} catch (error) {
  console.log('❌ Standard connection failed:', error.message);
}

// Test 2: Connection without TLS
console.log('\nTest 2: Connection without TLS');
try {
  const uriWithoutTLS = process.env.MONGODB_URI.replace('?retryWrites=true', '?retryWrites=true&tls=false');
  const connection = await mongoose.connect(uriWithoutTLS, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 5000,
    family: 4
  });
  console.log('✅ Connection without TLS successful');
  await mongoose.connection.close();
} catch (error) {
  console.log('❌ Connection without TLS failed:', error.message);
}

// Test 3: Direct IP connection (if available)
console.log('\nTest 3: Testing if you can get IP address');
import { lookup } from 'dns/promises';

try {
  const addresses = await lookup('cluster0.nyg7tdk.mongodb.net');
  console.log('✅ DNS resolution successful');
  console.log('   IP:', addresses.address);
  console.log('   You can try replacing the hostname in your connection string with this IP');
} catch (error) {
  console.log('❌ DNS resolution failed:', error.message);
  console.log('   This confirms the DNS issue');
}

console.log('\n🔧 Troubleshooting tips:');
console.log('1. Try changing your DNS server to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)');
console.log('2. Check if you are behind a corporate firewall');
console.log('3. Try connecting from a different network');
console.log('4. Ensure your IP is whitelisted in MongoDB Atlas Network Access settings');