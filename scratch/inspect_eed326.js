import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';
import Quiz from '../models/Quiz.js';

dotenv.config();

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const departments = await Department.find({ name: { $in: [
      /Software/i, /Networking/i, /Cyber/i, /Artificial/i, /Computer Science/i
    ]}});
    console.log("\nFound Departments:");
    departments.forEach(d => console.log(`- ${d.name} (_id: ${d._id})`));

    const eedCourses = await Course.find({ title: /EED/i });
    console.log("\nExisting EED Courses:");
    eedCourses.forEach(c => console.log(`- Title: ${c.title}, Level: ${c.level}, Sem: ${c.semester}, Dept: ${c.department}, Price: ₦${c.price}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
