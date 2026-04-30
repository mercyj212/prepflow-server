import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const schoolOfIct = await Faculty.findOne({
      name: /^School of ICT$/i,
      path: 'polytechnic'
    });

    if (!schoolOfIct) {
      throw new Error('School of ICT faculty was not found. Run init_ict_structure.js first.');
    }

    const computerScience = await Department.findOne({
      name: /^Computer Science$/i,
      faculty: schoolOfIct._id
    });

    if (!computerScience) {
      throw new Error('Computer Science department was not found under School of ICT. Run init_ict_structure.js first.');
    }

    const quizCourseIds = await Quiz.distinct('course');
    const courseFilter = quizCourseIds.length > 0
      ? { _id: { $in: quizCourseIds } }
      : {};

    const result = await Course.updateMany(courseFilter, {
      $set: {
        path: 'polytechnic',
        level: 'ND1',
        department: computerScience._id
      }
    });

    console.log(`Moved ${result.modifiedCount} course(s) to Polytechnic / School of ICT / Computer Science / ND1.`);
    console.log(`Matched ${result.matchedCount} course(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Move failed:', err.message);
    process.exit(1);
  }
};

run();
