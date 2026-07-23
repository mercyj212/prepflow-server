import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

async function checkQuizzesPopulate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const coursePopulate = {
      path: "course",
      select: "title level path department",
      populate: {
        path: "department",
        select: "name faculty",
        populate: { path: "faculty", select: "name path" },
      },
    };

    const quizzes = await Quiz.find({ isActive: true }).populate(coursePopulate);
    console.log(`Fetched ${quizzes.length} active quizzes:\n`);

    quizzes.forEach((q, idx) => {
      const deptName = q.course?.department?.name || q.department?.name || 'NO DEPT';
      const level = q.course?.level || q.level || 'NO LEVEL';
      console.log(`${idx + 1}. Quiz: "${q.title}" | Course: "${q.course?.title}" | Dept: "${deptName}" | Level: "${level}"`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkQuizzesPopulate();
