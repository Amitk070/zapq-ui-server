#!/usr/bin/env node

/**
 * 🧪 New Architecture Test Script
 * 
 * This script tests the updated backend endpoints to ensure
 * the new layered architecture is working correctly.
 */

const API_BASE = 'http://localhost:3001'; // Your backend URL

async function testBackend() {
  console.log('🚀 Testing New Architecture Backend...\n');

  // Test 1: Basic /chat endpoint
  console.log('1️⃣ Testing /chat endpoint...');
  try {
    const chatResponse = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: 'Say hello and confirm you are working',
        maxTokens: 100 
      })
    });
    
    const chatData = await chatResponse.json();
    
    if (chatData.success) {
      console.log('✅ /chat endpoint working');
      console.log(`📝 Response: ${chatData.response.substring(0, 50)}...`);
      console.log(`💎 Tokens used: ${chatData.tokensUsed}`);
    } else {
      console.log('❌ /chat endpoint failed:', chatData.error);
    }
  } catch (error) {
    console.log('❌ /chat endpoint error:', error.message);
  }

  console.log('\n' + '─'.repeat(50) + '\n');

  // Test 2: Project generation endpoint
  console.log('2️⃣ Testing /generate-project endpoint...');
  try {
    const projectResponse = await fetch(`${API_BASE}/generate-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: 'Analyze this request: Create a simple React button component',
        maxTokens: 1000
      })
    });
    
    const projectData = await projectResponse.json();
    
    if (projectData.success) {
      console.log('✅ /generate-project endpoint working');
      console.log(`📄 Response type: ${projectData.isJson ? 'JSON' : 'Text'}`);
      console.log(`💎 Tokens used: ${projectData.tokensUsed}`);
    } else {
      console.log('❌ /generate-project endpoint failed:', projectData.error);
    }
  } catch (error) {
    console.log('❌ /generate-project endpoint error:', error.message);
  }

  console.log('\n' + '─'.repeat(50) + '\n');

  // Test 3: File editing endpoint
  console.log('3️⃣ Testing /edit-file endpoint...');
  try {
    const editResponse = await fetch(`${API_BASE}/edit-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: 'Add a comment to this code',
        filePath: 'src/App.tsx',
        currentContent: 'function App() {\n  return <div>Hello</div>;\n}',
        maxTokens: 500
      })
    });
    
    const editData = await editResponse.json();
    
    if (editData.success) {
      console.log('✅ /edit-file endpoint working');
      console.log(`📄 Updated file: ${editData.filePath}`);
      console.log(`💎 Tokens used: ${editData.tokensUsed}`);
    } else {
      console.log('❌ /edit-file endpoint failed:', editData.error);
    }
  } catch (error) {
    console.log('❌ /edit-file endpoint error:', error.message);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('🎉 Architecture test complete!');
  console.log('💡 If all endpoints show ✅, your new architecture is ready!');
}

// Run the test
if (typeof fetch === 'undefined') {
  // Node.js environment - need to import fetch
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    testBackend();
  });
} else {
  // Browser environment
  testBackend();
} 
