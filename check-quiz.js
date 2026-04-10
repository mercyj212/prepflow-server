import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/Quiz.js';

dotenv.config();

async function checkSpecificQuiz() {
  await mongoose.connect(process.env.MONGODB_URI);
  const quizId = '69cc7189039db582ef09124d';
  const quiz = await Quiz.findById(quizId);
  if (quiz) {
    console.log('Quiz found:', quiz.title);
    quiz.questions.forEach((q, qIndex) => {
      console.log(`Question ${qIndex + 1}: ${q.text.substring(0, 30)}...`);
      q.options.forEach(o => {
        console.log(`  - Option: ${o.text.substring(0, 20)}... | isCorrect: ${o.isCorrect} (Type: ${typeof o.isCorrect})`);
      });
    });
  } else {
    console.log('Quiz 69cc7189039db582ef09124d not found.');
  }
  process.exit();
}

checkSpecificQuiz();
