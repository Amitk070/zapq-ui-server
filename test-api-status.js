#!/usr/bin/env node

/**
 * Test script to check Claude API status
 * Run this to diagnose API issues
 */

const SERVER_URL = process.env.SERVER_URL || 'https://zapq-ui-server.onrender.com';

async function testApiStatus() {
  console.log('🔍 Testing Claude API Status...');
  console.log(`🌐 Server: ${SERVER_URL}`);
  console.log('');

  try {
    // Test the new API status endpoint
    console.log('📡 Testing /api-status endpoint...');
    const statusResponse = await fetch(`${SERVER_URL}/api-status`);
    const statusData = await statusResponse.json();
    
    console.log('📊 API Status Response:');
    console.log(`  Success: ${statusData.success}`);
    console.log(`  Status: ${statusData.status}`);
    console.log(`  Message: ${statusData.message}`);
    
    if (statusData.instructions) {
      console.log(`  Instructions: ${statusData.instructions}`);
    }
    
    if (statusData.errorCode) {
      console.log(`  Error Code: ${statusData.errorCode}`);
    }
    
    if (statusData.errorDetails) {
      console.log(`  Error Details: ${statusData.errorDetails}`);
    }
    
    console.log('');

    // Test the debug endpoint
    console.log('🔧 Testing /debug-api-key endpoint...');
    const debugResponse = await fetch(`${SERVER_URL}/debug-api-key`);
    const debugData = await debugResponse.json();
    
    console.log('🔑 API Key Debug Info:');
    console.log(`  Has Key: ${debugData.hasKey}`);
    console.log(`  Key Length: ${debugData.keyLength}`);
    console.log(`  Key Prefix: ${debugData.keyPrefix}`);
    console.log(`  Valid Format: ${debugData.isValidFormat}`);
    
    console.log('');

    // Provide recommendations based on status
    if (statusData.status === 'insufficient_credits') {
      console.log('💡 RECOMMENDATION:');
      console.log('  Your Claude API credit balance is too low.');
      console.log('  Please visit: https://console.anthropic.com/');
      console.log('  Go to Plans & Billing to upgrade or purchase credits.');
      console.log('');
    } else if (statusData.status === 'invalid_api_key') {
      console.log('💡 RECOMMENDATION:');
      console.log('  Your Claude API key is invalid or expired.');
      console.log('  Please check your ANTHROPIC_API_KEY environment variable.');
      console.log('  Generate a new key at: https://console.anthropic.com/');
      console.log('');
    } else if (statusData.status === 'no_api_key') {
      console.log('💡 RECOMMENDATION:');
      console.log('  No Claude API key is configured.');
      console.log('  Please set ANTHROPIC_API_KEY in your environment variables.');
      console.log('  Get your key from: https://console.anthropic.com/');
      console.log('');
    } else if (statusData.status === 'api_working') {
      console.log('✅ Claude API is working correctly!');
      console.log('  You should be able to generate projects now.');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error testing API status:', error.message);
    console.log('');
    console.log('💡 TROUBLESHOOTING:');
    console.log('  1. Check if the server is running');
    console.log('  2. Verify the SERVER_URL environment variable');
    console.log('  3. Check your internet connection');
    console.log('');
  }
}

// Run the test
testApiStatus().catch(console.error); 