import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const testLeaderboard = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected");
    
    const topDrivers = await Student.find({ prepDriveScore: { $gt: 0 } })
      .sort({ prepDriveScore: -1 })
      .limit(10)
      .select("fullName profilePicture prepDriveScore prepDriveAwards");
      
    console.log("Leaderboard Data:", JSON.stringify(topDrivers, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
};

testLeaderboard();
