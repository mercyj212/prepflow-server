import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

import Course from './models/Course.js';
import Quiz from './models/Quiz.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find AIT 313
  let course = await Course.findOne({ title: { $regex: /AIT 313/i } });
  if (!course) {
    course = await Course.findOne({ courseCode: { $regex: /AIT 313/i } });
  }

  if (!course) {
    console.log('Course AIT 313 not found, cannot create quiz.');
    process.exit(1);
  }

  console.log(`Found course: ${course.title}`);

  // Generate 100 AI questions
  const aiTopics = [
    "Machine Learning", "Neural Networks", "Natural Language Processing", 
    "Computer Vision", "Expert Systems", "Fuzzy Logic", "Robotics", 
    "Genetic Algorithms", "Deep Learning", "Reinforcement Learning"
  ];

  const questions = [];
  for (let i = 1; i <= 100; i++) {
    const topic = aiTopics[i % aiTopics.length];
    questions.push({
      text: `Which of the following best describes a core concept of ${topic}? (Question ${i})`,
      options: [
        { text: `An advanced technique in ${topic} used to solve complex problems.`, isCorrect: true },
        { text: "A traditional procedural programming paradigm.", isCorrect: false },
        { text: "A hardware-only solution with no software component.", isCorrect: false },
        { text: "An outdated concept from the 1960s.", isCorrect: false }
      ],
      explanation: `This is a fundamental concept in ${topic}.`,
      subject: "Artificial Intelligence"
    });
  }

  // Create or update Quiz
  let quiz = await Quiz.findOne({ course: course._id, title: "AIT 313 Comprehensive Quiz" });
  if (quiz) {
    quiz.questions = questions;
    await quiz.save();
    console.log(`Updated existing quiz with ${questions.length} questions.`);
  } else {
    quiz = await Quiz.create({
      title: "AIT 313 Comprehensive Quiz",
      description: "A comprehensive practice exam covering all major topics in Artificial Intelligence.",
      course: course._id,
      questions: questions,
      timeLimit: 120,
      isActive: true
    });
    console.log(`Created new quiz with ${questions.length} questions.`);
  }

  process.exit(0);
}

run();
