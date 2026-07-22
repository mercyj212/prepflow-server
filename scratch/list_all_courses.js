import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';

dotenv.config();

async function checkCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const courses = await Course.find({}).populate('department');
    console.log(`Total Courses: ${courses.length}`);
    courses.forEach(c => {
      console.log(`Course: ${c.title} | Dept: ${c.department?.name || 'NULL'} | Level: ${c.level} | Sem: ${c.semester} | Price: ₦${c.price}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCourses();
