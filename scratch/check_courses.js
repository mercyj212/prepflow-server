import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Course from './models/Course.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = await Course.find({}).lean();
  console.log('Courses in DB:', courses.map(c => c.courseCode + ' - ' + c.title));
  process.exit(0);
}
run();
