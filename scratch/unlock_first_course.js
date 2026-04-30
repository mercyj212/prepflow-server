import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import CourseAccess from '../models/CourseAccess.js';
import Quiz from '../models/Quiz.js';

dotenv.config();

const setupUserAccess = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'jaymercy510@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User ${email} not found`);
      process.exit(1);
    }
    console.log(`Found user: ${user._id} (${user.role})`);

    // Find courses that have quizzes (these are the ones in PrepDrive)
    const quizzes = await Quiz.find({ "questions.0": { $exists: true } }).populate('course');
    const coursesWithQuizzes = [];
    const seen = new Set();
    
    for (const quiz of quizzes) {
      if (quiz.course && !seen.has(quiz.course._id.toString())) {
        coursesWithQuizzes.push(quiz.course);
        seen.add(quiz.course._id.toString());
      }
    }

    if (coursesWithQuizzes.length === 0) {
      console.error('No courses with quizzes found');
      process.exit(1);
    }

    const firstCourse = coursesWithQuizzes[0];
    console.log(`First course identified: ${firstCourse.title} (${firstCourse._id})`);

    // Remove all existing course access for this user
    await CourseAccess.deleteMany({ student: user._id });
    console.log(`Cleared all existing access for ${email}`);

    // Create access for only the first course
    const access = new CourseAccess({
      student: user._id,
      course: firstCourse._id,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });
    await access.save();
    console.log(`Successfully granted access to ${firstCourse.title} for ${email}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

setupUserAccess();
