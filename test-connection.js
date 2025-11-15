// Simple test script to verify backend connection
const http = require('http');

// Test the backend health endpoint
const options = {
  hostname: 'localhost',
  port: 8002,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Test completed');
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();