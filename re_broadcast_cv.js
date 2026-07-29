import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import sendEmail from './utils/emailService.js';

async function broadcast() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for broadcast...");

  const db = mongoose.connection.db;
  const users = await db.collection('students').find({}).toArray();
  console.log(`Found ${users.length} registered users in database.`);

  const courseTitle = "COMPUTER VISION";
  let count = 0;

  for (const user of users) {
    if (!user.email) continue;
    try {
      console.log(`[SENDING ${count + 1}/${users.length}]: ${user.email}...`);
      await sendEmail({
        email: user.email,
        subject: `🚀 New Course Available: ${courseTitle}!`,
        template: "courseUpdate",
        context: {
          name: user.fullName || user.nickname || "PrepUp User",
          courseTitle,
          loginUrl: `${process.env.FRONTEND_URL || "https://prepupcbt.vercel.app"}/login`
        }
      });
      count++;
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error(`[FAILED]: ${user.email} - ${e.message}`);
    }
  }

  console.log(`\n🎉 Successfully delivered course email notification to ${count} users via SMTP!`);
  process.exit(0);
}

broadcast().catch(console.error);
