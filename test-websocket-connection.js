#!/usr/bin/env node

/**
 * Test WebSocket connection to the backend
 * This will help diagnose the timeout issue
 */

const { io } = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'https://zapq-ui-server.onrender.com';
const SESSION_ID = 'test-session-' + Date.now();

console.log('🔌 Testing WebSocket Connection...');
console.log(`🌐 Server: ${SERVER_URL}`);
console.log(`🆔 Session: ${SESSION_ID}`);
console.log('');

// Create socket connection
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true
});

// Connection events
socket.on('connect', () => {
  console.log('✅ WebSocket Connected!');
  console.log(`🔗 Socket ID: ${socket.id}`);
  
  // Join the test session
  socket.emit('join-session', SESSION_ID);
  console.log(`📡 Joined session: ${SESSION_ID}`);
  
  // Test a simple message
  socket.emit('test-message', { message: 'Hello from test client' });
});

socket.on('disconnect', (reason) => {
  console.log('❌ WebSocket Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('💥 Connection Error:', error.message);
  console.log('🔍 Error details:', error);
});

// Listen for generation events
socket.on('generation-started', (data) => {
  console.log('🚀 Generation Started:', data);
});

socket.on('generation-progress', (data) => {
  console.log('📊 Progress Update:', data);
});

socket.on('generation-complete', (data) => {
  console.log('✅ Generation Complete:', data);
});

socket.on('generation-error', (data) => {
  console.log('❌ Generation Error:', data);
});

// Test message response
socket.on('test-response', (data) => {
  console.log('📨 Test Response:', data);
});

// Error handling
socket.on('error', (error) => {
  console.log('💥 Socket Error:', error);
});

// Test HTTP endpoints
async function testHttpEndpoints() {
  console.log('\n🌐 Testing HTTP Endpoints...');
  
  try {
    // Test CORS preflight
    console.log('📡 Testing CORS preflight...');
    const corsResponse = await fetch(`${SERVER_URL}/orchestrate-project`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://code.zapq.dev',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`  CORS Status: ${corsResponse.status}`);
    console.log(`  CORS Headers:`, {
      'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers')
    });
    
    // Test API status
    console.log('\n📡 Testing API status...');
    const statusResponse = await fetch(`${SERVER_URL}/api-status`);
    const statusData = await statusResponse.json();
    
    console.log(`  API Status: ${statusResponse.status}`);
    console.log(`  Response:`, statusData);
    
  } catch (error) {
    console.log('❌ HTTP Test Error:', error.message);
  }
}

// Run tests
setTimeout(() => {
  testHttpEndpoints();
  
  // Disconnect after tests
  setTimeout(() => {
    console.log('\n🔌 Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 5000);
}, 2000);

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🔌 Graceful shutdown...');
  socket.disconnect();
  process.exit(0);
}); 