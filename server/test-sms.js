// Quick SMS Test Script
// Run this after installing packages and setting up .env
// Usage: node test-sms.js +919876543210

import 'dotenv/config';
import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.error('❌ Please provide a phone number:');
  console.log('   node test-sms.js +919876543210');
  process.exit(1);
}

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error('❌ Twilio credentials not found in .env file!');
  console.log('   Make sure your server/.env file contains:');
  console.log('   TWILIO_ACCOUNT_SID=...');
  console.log('   TWILIO_AUTH_TOKEN=...');
  console.log('   TWILIO_PHONE_NUMBER=...');
  process.exit(1);
}

console.log('📱 Testing SMS with Twilio...\n');
console.log(`From: ${TWILIO_PHONE_NUMBER}`);
console.log(`To: ${phoneNumber}\n`);

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const message = `🩺 ArogyaAI Test SMS

This is a test message from your SMS & WhatsApp system!

✅ Twilio integration is working
✅ SMS delivery is functional
✅ You're ready to go!

Time: ${new Date().toLocaleString()}`;

client.messages
  .create({
    body: message,
    from: TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  })
  .then((msg) => {
    console.log('✅ SMS sent successfully!\n');
    console.log(`Message SID: ${msg.sid}`);
    console.log(`Status: ${msg.status}`);
    console.log(`Direction: ${msg.direction}`);
    console.log('\n📱 Check your phone for the SMS!');
  })
  .catch((error) => {
    console.error('❌ Failed to send SMS:\n');
    console.error(error.message);
    
    if (error.code === 21211) {
      console.log('\n💡 Tip: Invalid phone number format. Try:');
      console.log('   +919876543210 (India)');
      console.log('   +12345678900 (US)');
    }
  });

