import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Department from '../models/Department.js';

dotenv.config();

async function debugQuizMatch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const gnsCourses = await Course.find({ title: /COMMUNICATION SKILLS/i }).populate('department');
    console.log(`Found ${gnsCourses.length} GNS courses:`);
    for (const c of gnsCourses) {
      const q = await Quiz.findOne({ course: c._id });
      console.log(`Course ID: ${c._id} | Code: "${c.code}" | Level: "${c.level}" | Dept: ${c.department?.name} | Quiz found: ${q ? q.title + ' (ID: ' + q._id + ')' : 'NONE!'}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugQuizMatch();
