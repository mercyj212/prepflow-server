import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Department from '../models/Department.js';

dotenv.config();

async function checkAllCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const courses = await Course.find({}).populate('department');
    console.log(`Found ${courses.length} total courses in database:\n`);
    courses.forEach((c, idx) => {
      console.log(`${idx + 1}. ID: ${c._id} | Code: "${c.code}" | Title: "${c.title}" | Dept: ${c.department?.name || 'NO DEPT'} | Level: ${c.level} | Semester: ${c.semester}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAllCourses();
