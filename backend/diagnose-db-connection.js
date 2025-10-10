import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { lookup } from 'dns/promises';
import { createRequire } from 'module';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
dotenv.config();

// Use createRequire to import dns from the standard library
const require = createRequire(import.meta.url);
const dns = require('dns');
const execPromise = promisify(exec);

const diagnoseConnection = async () => {
  console.log('🔍 MongoDB Connection Diagnosis Tool');
  console.log('=====================================');
  
  // 1. Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI is not set in environment variables');
    return;
  }
  
  console.log('✅ MONGODB_URI is set');
  
  // 2. Parse the URI to extract hostname
  try {
    const uri = new URL(process.env.MONGODB_URI);
    const hostname = uri.hostname;
    console.log('🌐 MongoDB Hostname:', hostname);
    
    // 3. Test DNS resolution
    console.log('\n📡 Testing DNS Resolution...');
    try {
      const dnsResult = await lookup(hostname);
      console.log('✅ DNS Resolution Successful');
      console.log('   IP Address:', dnsResult.address);
      console.log('   Family:', dnsResult.family);
    } catch (dnsError) {
      console.log('❌ DNS Resolution Failed');
      console.log('   Error:', dnsError.message);
      
      // Try alternative DNS resolution methods
      console.log('\n🔄 Trying alternative DNS resolution methods...');
      
      try {
        // Try with system DNS
        const addresses = await new Promise((resolve, reject) => {
          dns.resolve4(hostname, (err, addresses) => {
            if (err) reject(err);
            else resolve(addresses);
          });
        });
        console.log('✅ System DNS Resolution Successful');
        console.log('   IP Addresses:', addresses);
      } catch (systemDnsError) {
        console.log('❌ System DNS Resolution Failed');
        console.log('   Error:', systemDnsError.message);
      }
      
      // Try ping command
      console.log('\n🔄 Testing connectivity with ping...');
      try {
        const { stdout, stderr } = await execPromise(`ping -n 1 ${hostname}`);
        console.log('✅ Ping Successful');
        console.log('   Output:', stdout.trim());
      } catch (pingError) {
        console.log('❌ Ping Failed');
        console.log('   Error:', pingError.message);
      }
      
      return;
    }
    
    // 4. Test MongoDB connection with various options
    console.log('\n🔌 Testing MongoDB Connection...');
    
    // Test with standard options
    try {
      console.log('   Attempting connection with standard options...');
      const connectionDb = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 5000,
        family: 4,
        tls: true,
        retryWrites: true,
        w: "majority"
      });
      
      console.log('✅ MongoDB Connection Successful!');
      console.log('   Host:', connectionDb.connection.host);
      console.log('   Database:', connectionDb.connection.name);
      
      // Close connection
      await mongoose.connection.close();
      console.log('   Connection closed.');
    } catch (error) {
      console.log('❌ MongoDB Connection Failed');
      console.log('   Error Code:', error.code);
      console.log('   Error Message:', error.message);
      
      // Specific error handling
      if (error.code === 'ENOTFOUND') {
        console.log('\n💡 Troubleshooting ENOTFOUND Error:');
        console.log('   1. Verify the MongoDB URI hostname is correct');
        console.log('   2. Check your network connectivity');
        console.log('   3. Verify DNS resolution is working');
        console.log('   4. Check if a firewall is blocking DNS requests');
        console.log('   5. Try using a different DNS server (e.g., 8.8.8.8)');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Troubleshooting ECONNREFUSED Error:');
        console.log('   1. Verify MongoDB service is running');
        console.log('   2. Check network connectivity');
        console.log('   3. Verify firewall settings');
      }
    }
    
  } catch (parseError) {
    console.log('❌ Failed to parse MongoDB URI');
    console.log('   Error:', parseError.message);
    return;
  }
  
  console.log('\n📋 MongoDB Atlas Network Access Checklist:');
  console.log('   1. Log into MongoDB Atlas dashboard');
  console.log('   2. Go to Network Access (under Security)');
  console.log('   3. Verify your current IP is in the access list');
  console.log('   4. For testing, you can temporarily add 0.0.0.0/0');
  console.log('   5. Remember to remove 0.0.0.0/0 for production security');
  
  console.log('\n🔧 Additional Troubleshooting Steps:');
  console.log('   1. Try changing your DNS server to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)');
  console.log('   2. Check if you are behind a corporate firewall or VPN that might be blocking connections');
  console.log('   3. Try connecting from a different network (e.g., mobile hotspot)');
  console.log('   4. Verify that your MongoDB Atlas cluster is deployed and running');
};

diagnoseConnection();