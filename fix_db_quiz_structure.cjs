require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const dbCourseId = new mongoose.Types.ObjectId('69e2146d67e00d9c07c51d5a');

  // Fetch all 300 loose question items for DATABASE DESIGN
  const rawItems = await db.collection('quizzes').find({ course: dbCourseId }).toArray();
  console.log(`Found ${rawItems.length} raw question documents.`);

  // Extract valid questions format
  const formattedQuestions = [];
  for (const item of rawItems) {
    if (item.text && item.options && Array.isArray(item.options)) {
      formattedQuestions.push({
        text: item.text,
        options: item.options.map(opt => ({
          text: opt.text,
          isCorrect: Boolean(opt.isCorrect)
        })),
        explanation: item.explanation || '',
        subject: item.topic || 'Database Systems'
      });
    }
  }

  console.log(`Formatted ${formattedQuestions.length} valid questions.`);

  if (formattedQuestions.length > 0) {
    // Delete the loose individual question documents
    const deleteRes = await db.collection('quizzes').deleteMany({ course: dbCourseId });
    console.log(`Deleted ${deleteRes.deletedCount} loose question documents.`);

    // Create single proper Quiz document
    const newQuiz = {
      title: "DATABASE DESIGN CBT PRACTICE EXAM",
      description: "Comprehensive practice exam with 300 questions covering Database Systems, ER Diagrams, Relational Algebra, SQL, Normalization, Transactions, and Security.",
      course: dbCourseId,
      questions: formattedQuestions,
      timeLimit: 45,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertRes = await db.collection('quizzes').insertOne(newQuiz);
    console.log(`✅ Successfully created Quiz document ID: ${insertRes.insertedId}`);
  }

  // Verification
  const finalQuiz = await db.collection('quizzes').findOne({ course: dbCourseId });
  console.log('\nFinal Quiz Verification:');
  console.log(`  Quiz ID:    ${finalQuiz._id}`);
  console.log(`  Title:      ${finalQuiz.title}`);
  console.log(`  isActive:   ${finalQuiz.isActive}`);
  console.log(`  Questions:  ${finalQuiz.questions?.length}`);
  console.log(`  Course ID:  ${finalQuiz.course}`);

  mongoose.disconnect();
});
