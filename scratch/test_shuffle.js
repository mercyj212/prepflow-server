
import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const quiz = await db.collection('quizzes').findOne({ _id: new mongoose.Types.ObjectId('6a611d48f215e13ef46b539b') });
  
  const shuffleArray = (array) => {
    if (!array || !Array.isArray(array)) return [];
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const shuffleQuestionOptions = (question) => ({
    ...question,
    options: shuffleArray(question.options || []).map(option => ({
      ...option,
      isCorrect: Boolean(option.isCorrect)
    }))
  });

  const shuffleQuizQuestionOptions = (questions = []) => (
    questions.map(question => shuffleQuestionOptions(question))
  );

  console.log('Original length:', quiz.questions ? quiz.questions.length : 0);
  const randomQuestions = shuffleArray(quiz.questions).slice(0, 60);
  console.log('randomQuestions length:', randomQuestions.length);
  const finalQuestions = shuffleQuizQuestionOptions(randomQuestions);
  console.log('finalQuestions length:', finalQuestions.length);
  
  process.exit(0);
});

