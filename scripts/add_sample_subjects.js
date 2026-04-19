import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';

dotenv.config();

const addSampleSubjects = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Fetching all quizzes...');
    const quizzes = await Quiz.find().populate('course');

    for (const quiz of quizzes) {
      console.log(`Processing quiz: ${quiz.title}`);
      
      const isEntrance = quiz.course?.path === 'entrance';
      
      quiz.questions.forEach((q, index) => {
        if (isEntrance) {
          // Assign common entrance subjects
          const subjects = ['English', 'Mathematics', 'Biology', 'Physics', 'Chemistry'];
          q.subject = subjects[index % subjects.length];
        } else {
          // Assign course-specific areas
          const areas = ['Core Fundamentals', 'Advanced Logic', 'System Architecture', 'Security Protocols'];
          q.subject = areas[index % areas.length];
        }
      });

      await quiz.save();
      console.log(`Updated subjects for: ${quiz.title}`);
    }

    console.log('Sample data seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding subjects:', err);
    process.exit(1);
  }
};

addSampleSubjects();
