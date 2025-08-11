#!/usr/bin/env node

/**
 * WebSocket Test Script for ZapQ UI Server
 * Tests WebSocket connection and event handling
 */

import { io } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const SESSION_ID = 'test-session-' + Date.now();

console.log('🧪 Testing WebSocket connection to ZapQ UI Server');
console.log(`🔗 Server: ${SERVER_URL}`);
console.log(`🆔 Session: ${SESSION_ID}`);
console.log('');

// Create Socket.IO connection
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to server');
  console.log(`🆔 Socket ID: ${socket.id}`);
  
  // Join test session
  console.log(`📡 Joining session: ${SESSION_ID}`);
  socket.emit('join-session', SESSION_ID);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Session events
socket.on('generation-started', (data) => {
  console.log('🚀 Generation started:', data);
});

socket.on('generation-progress', (data) => {
  console.log(`📊 Progress: ${data.progress}% - ${data.step}`);
});

socket.on('generation-complete', (data) => {
  console.log('✅ Generation complete:', data);
  process.exit(0);
});

socket.on('generation-error', (data) => {
  console.error('❌ Generation error:', data);
  process.exit(1);
});

socket.on('generation-cancelled', (data) => {
  console.log('🚫 Generation cancelled:', data);
});

// Test generation status endpoint
async function testStatusEndpoint() {
  try {
    console.log('\n🔍 Testing status endpoint...');
    const response = await fetch(`${SERVER_URL}/generation-status/${SESSION_ID}`);
    const data = await response.json();
    console.log('📊 Status response:', data);
  } catch (error) {
    console.error('❌ Status endpoint error:', error.message);
  }
}

// Test cancellation endpoint
async function testCancellationEndpoint() {
  try {
    console.log('\n🚫 Testing cancellation endpoint...');
    const response = await fetch(`${SERVER_URL}/cancel-generation/${SESSION_ID}`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log('📊 Cancellation response:', data);
  } catch (error) {
    console.error('❌ Cancellation endpoint error:', error.message);
  }
}

// Test orchestrate-project endpoint
async function testOrchestrateEndpoint() {
  try {
    console.log('\n🏗️ Testing orchestrate-project endpoint...');
    const response = await fetch(`${SERVER_URL}/orchestrate-project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stackId: 'react-vite-tailwind',
        userPrompt: 'Create a simple test landing page',
        projectName: 'Test Project',
        sessionId: SESSION_ID
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Orchestrate response:', {
        success: data.success,
        fileCount: data.files?.length || 0,
        tokensUsed: data.tokensUsed
      });
    } else {
      console.error('❌ Orchestrate endpoint error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Orchestrate endpoint error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('⏳ Waiting for connection...');
  
  // Wait for connection
  await new Promise(resolve => {
    if (socket.connected) {
      resolve();
    } else {
      socket.once('connect', resolve);
    }
  });
  
  // Wait a bit for session setup
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test endpoints
  await testStatusEndpoint();
  await testCancellationEndpoint();
  
  // Test orchestration (this will trigger WebSocket events)
  console.log('\n🚀 Starting test generation...');
  await testOrchestrateEndpoint();
  
  // Wait for events or timeout
  console.log('\n⏳ Waiting for generation events (30s timeout)...');
  setTimeout(() => {
    console.log('⏰ Timeout reached, exiting...');
    process.exit(0);
  }, 30000);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  socket.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  socket.disconnect();
  process.exit(0);
});

// Start tests
runTests().catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
}); 