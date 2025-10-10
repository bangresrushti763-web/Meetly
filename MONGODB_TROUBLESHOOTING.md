# MongoDB Connection Troubleshooting Guide

## Problem Identified
The application is failing to connect to MongoDB with an `ENOTFOUND` error, which indicates a DNS resolution issue. The hostname `cluster0.nyg7tdk.mongodb.net` cannot be resolved to an IP address.

## Root Causes
1. **DNS Resolution Issues** - Your system cannot resolve the MongoDB Atlas hostname
2. **Network Connectivity Problems** - Firewalls or network restrictions blocking DNS requests
3. **MongoDB Atlas Network Access** - Your IP address may not be whitelisted

## Solutions

### Solution 1: Fix DNS Resolution (Recommended)
1. **Change DNS Server**:
   - Open Network Settings
   - Change DNS to Google (8.8.8.8) or Cloudflare (1.1.1.1)
   - Restart your network connection

2. **Flush DNS Cache**:
   ```cmd
   ipconfig /flushdns
   ```

3. **Test DNS Resolution**:
   ```cmd
   nslookup cluster0.nyg7tdk.mongodb.net
   ```

### Solution 2: Update MongoDB Atlas Network Access
1. Log into [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to **Network Access** under Security
3. Click **Add IP Address**
4. Either:
   - Add your current IP (click "Add Current IP Address")
   - For testing only: Add `0.0.0.0/0` (allows access from anywhere)
   - **Important**: Remove `0.0.0.0/0` for production environments

### Solution 3: Use Connection String IP Instead of Hostname
Replace the hostname in your connection string with the actual IP address:
1. Find the IP address:
   ```cmd
   nslookup cluster0.nyg7tdk.mongodb.net
   ```
2. Update your [.env](file:///C:/Users/HP/OneDrive/Desktop/Srushh/MY%20PROJECT%20WORK(SOFTWARE)/Meetly/backend/.env) file:
   ```
   MONGODB_URI=mongodb+srv://meetly:meetly@IP_ADDRESS_HERE/meetly?retryWrites=true&w=majority
   ```

### Solution 4: Corporate Network Issues
If you're on a corporate network:
1. Contact your IT department about MongoDB access
2. Try connecting from a different network (home/mobile hotspot)
3. Use a VPN service to bypass network restrictions

## Temporary Workaround
The application is designed to work in fallback mode using in-memory storage, which is suitable for development and testing. This is the expected behavior when MongoDB is not accessible.

## Testing Connection
Run our diagnostic tool:
```bash
npm run diagnose-db
```

## For Production Deployment
1. Ensure proper DNS resolution
2. Whitelist your server's IP in MongoDB Atlas
3. Use environment-specific connection strings
4. Set proper timeouts in connection options

## Contact Support
If issues persist:
1. Check MongoDB Atlas status: https://status.mongodb.com/
2. Contact MongoDB Support
3. Verify your cluster is deployed and running