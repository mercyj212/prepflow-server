import mongoose from "mongoose";
import dns from "dns";

// 🛡️ DNS RESCUE: Force use of Google Public DNS
// This prevents 'ESERVFAIL' errors on unstable networks/hotspots when resolving Atlas SRV records.
dns.setServers(['8.8.8.8', '8.8.4.4']);

let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 20000,
    });
    retryCount = 0; // Reset on success
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    retryCount++;
    console.error(`MongoDB connection failed (attempt ${retryCount}): ${error.message}`);
    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(retryCount * 3000, 15000); // Max 15 seconds between retries
      console.log(`Retrying connection in ${delay / 1000}s...`);
      setTimeout(connectDB, delay);
    } else {
      console.error('Max retries reached. Please check MongoDB Atlas status.');
    }
  }
};

// Auto-reconnect on disconnect events
mongoose.connection.on('disconnected', () => {
  console.error('[DB]: MongoDB disconnected! Attempting reconnect...');
  retryCount = 0; // Reset for fresh reconnect cycle
  setTimeout(connectDB, 2000);
});

mongoose.connection.on('error', (err) => {
  console.error('[DB]: MongoDB connection error:', err.message);
});

mongoose.connection.on('connected', () => {
  console.log('[DB]: MongoDB connection restored.');
});

export default connectDB;