import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Course from '../models/Course.js';

const migrateCourses = async () => {
  try {
    await connectDB();
    console.log('Connected to DB for migration...');

    const result = await Course.updateMany(
      {}, 
      { $set: { level: 'ND1' } }
    );

    console.log(`Migration Complete: ${result.modifiedCount} courses updated to ND1.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration Failed:', err);
    process.exit(1);
  }
};

migrateCourses();
