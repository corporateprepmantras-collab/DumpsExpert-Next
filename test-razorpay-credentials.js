#!/usr/bin/env node

/**
 * Razorpay Credentials Test Script
 * Tests if your Razorpay credentials are valid
 */

require('dotenv').config({ path: '.env.local' });
const Razorpay = require('razorpay');

console.log('\n🔍 Testing Razorpay Credentials...\n');
console.log('='.repeat(60));

// Check environment variables
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

console.log('\n📋 Environment Variables Check:');
console.log('-'.repeat(60));

if (!keyId) {
  console.log('❌ RAZORPAY_KEY_ID: NOT SET');
  console.log('   Add to .env.local: RAZORPAY_KEY_ID=your_key_id');
  process.exit(1);
} else {
  console.log(`✅ RAZORPAY_KEY_ID: ${keyId}`);
}

if (!keySecret) {
  console.log('❌ RAZORPAY_KEY_SECRET: NOT SET');
  console.log('   Add to .env.local: RAZORPAY_KEY_SECRET=your_key_secret');
  process.exit(1);
} else {
  console.log(`✅ RAZORPAY_KEY_SECRET: ${keySecret.substring(0, 10)}...***`);
}

if (!publicKeyId) {
  console.log('⚠️  NEXT_PUBLIC_RAZORPAY_KEY_ID: NOT SET');
  console.log('   Add to .env.local: NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id');
} else {
  console.log(`✅ NEXT_PUBLIC_RAZORPAY_KEY_ID: ${publicKeyId}`);
}

// Check if they match
console.log('\n🔗 Credential Consistency Check:');
console.log('-'.repeat(60));

if (keyId && publicKeyId) {
  if (keyId === publicKeyId) {
    console.log('✅ Key IDs match between backend and frontend');
  } else {
    console.log('⚠️  WARNING: Key IDs do NOT match!');
    console.log('   Backend and frontend should use the same Key ID');
  }
}

// Test Razorpay connection
console.log('\n🔌 Testing Razorpay API Connection...');
console.log('-'.repeat(60));

async function testRazorpayConnection() {
  try {
    // Create Razorpay instance
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    console.log('✅ Razorpay client created successfully');

    // Try to create a test order
    console.log('\n💰 Creating test order...');
    
    const options = {
      amount: 100, // 1 INR (100 paise)
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    if (order && order.id) {
      console.log('✅ Test order created successfully!');
      console.log(`   Order ID: ${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Amount: ${order.amount / 100} ${order.currency}`);
      console.log(`   Receipt: ${order.receipt}`);
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 SUCCESS! Your Razorpay credentials are valid!');
      console.log('='.repeat(60));
      console.log('\n✅ Your Razorpay integration should work now.');
      console.log('✅ Make sure your dev server is restarted: npm run dev\n');
      
      // Test fetching the order to verify read access
      console.log('\n🔍 Testing order fetch (read access)...');
      const fetchedOrder = await razorpay.orders.fetch(order.id);
      
      if (fetchedOrder && fetchedOrder.id === order.id) {
        console.log('✅ Order fetch successful - Full API access confirmed!');
      }
      
    } else {
      throw new Error('Invalid response structure from Razorpay');
    }

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ FAILED! Razorpay credentials test failed');
    console.log('='.repeat(60));
    
    console.log('\n📋 Error Details:');
    console.log('-'.repeat(60));
    console.log('Error Message:', error.message);
    
    if (error.statusCode) {
      console.log('Status Code:', error.statusCode);
    }
    
    if (error.error) {
      console.log('Error Details:', JSON.stringify(error.error, null, 2));
    }

    console.log('\n💡 Possible Solutions:');
    console.log('-'.repeat(60));
    
    if (error.statusCode === 401 || error.statusCode === 400 || error.message.includes('Authentication') || error.message.includes('Invalid')) {
      console.log('❌ Authentication failed!');
      console.log('\n   Your credentials are invalid. Please:');
      console.log('   1. Go to: https://dashboard.razorpay.com/app/keys');
      console.log('   2. Select "Test Mode" (toggle in top-left)');
      console.log('   3. Copy "Key ID" (starts with rzp_test_...)');
      console.log('   4. Click "Generate Key Secret" if needed');
      console.log('   5. Copy "Key Secret"');
      console.log('   6. Update .env.local:');
      console.log('      RAZORPAY_KEY_ID=your_key_id');
      console.log('      RAZORPAY_KEY_SECRET=your_key_secret');
      console.log('      NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id');
      console.log('   7. Restart dev server: npm run dev');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network') || error.message.includes('ETIMEDOUT')) {
      console.log('❌ Network error!');
      console.log('\n   Cannot connect to Razorpay. Please check:');
      console.log('   1. Your internet connection');
      console.log('   2. Firewall settings');
      console.log('   3. VPN if using one');
      console.log('   4. Corporate proxy settings');
    } else if (error.message.includes('key_id') || error.message.includes('key_secret')) {
      console.log('❌ Invalid credential format!');
      console.log('\n   Please check:');
      console.log('   1. Key ID should start with "rzp_test_" or "rzp_live_"');
      console.log('   2. No extra spaces or quotes in .env.local');
      console.log('   3. No line breaks in the credentials');
    } else {
      console.log('❌ Unknown error occurred.');
      console.log('\n   Full error object:');
      console.log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
    
    console.log('\n');
    process.exit(1);
  }
}

testRazorpayConnection();
