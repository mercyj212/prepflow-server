import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Department from '../models/Department.js';

dotenv.config();

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = await Course.find().populate('department');
  console.log("=== ALL EXISTING COURSES ===");
  courses.forEach(c => {
    console.log(`Title: "${c.title}" | Dept: ${c.department?.name || 'NONE'} | Level: ${c.level} | Sem: ${c.semester}`);
  });
  process.exit(0);
}

inspect();
