require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const quizzes = await db.collection('quizzes').find({}).toArray();

  console.log(`Found ${quizzes.length} total quizzes in MongoDB:\n`);

  let totalQuestions = 0;
  let lengthDisparityCount = 0;

  for (const q of quizzes) {
    const questions = q.questions || [];
    totalQuestions += questions.length;

    let quizDisparities = 0;
    for (const item of questions) {
      if (!item.options || item.options.length === 0) continue;
      const correctOpt = item.options.find(o => o.isCorrect);
      const incorrectOpts = item.options.filter(o => !o.isCorrect);

      if (correctOpt && incorrectOpts.length > 0) {
        const correctLen = correctOpt.text.length;
        const avgIncorrectLen = incorrectOpts.reduce((acc, o) => acc + o.text.length, 0) / incorrectOpts.length;

        // If correct option is more than 1.5x longer than average incorrect option
        if (correctLen > avgIncorrectLen * 1.4 && (correctLen - avgIncorrectLen) > 15) {
          quizDisparities++;
          lengthDisparityCount++;
        }
      }
    }

    console.log(`Quiz: "${q.title}" [ID: ${q._id}]`);
    console.log(`  Total Questions: ${questions.length} | Questions with Long Correct Answers: ${quizDisparities}`);
  }

  console.log(`\n================ SUMMARY ================`);
  console.log(`Total Quizzes: ${quizzes.length}`);
  console.log(`Total Questions: ${totalQuestions}`);
  console.log(`Questions with obvious length bias: ${lengthDisparityCount} (${Math.round((lengthDisparityCount / totalQuestions) * 100)}%)`);
  console.log(`========================================`);

  mongoose.disconnect();
});
