import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

// 🛡️ DNS RESCUE: Force use of Google Public DNS to bypass hotspot resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function check() {
  const uri = process.env.MONGODB_URI;
  console.log('🚀 Attempting DNS-Overridden Connection to:', uri.split('@')[1]);
  
  try {
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    console.log('✅ SUCCESS! Connection established via Google DNS.');
    process.exit(0);
  } catch (err) {
    console.error('❌ FAILURE:', err.message);
    if (err.message.includes('ESERVFAIL')) {
      console.log('💡 TIP: Your network is blocking MongoDB DNS records. Try restarting your mobile hotspot.');
    } else if (err.message.includes('timeout')) {
      console.log('💡 TIP: Your IP address may have changed. Check your MongoDB Atlas Whitelist.');
    }
    process.exit(1);
  }
}
check();
