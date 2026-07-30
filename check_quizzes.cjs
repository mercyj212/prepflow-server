require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  console.log('=== CHECKING QUIZZES IN DB ===');
  const quizzes = await db.collection('quizzes').find({}).toArray();
  console.log(`Total Quizzes: ${quizzes.length}`);

  for (const q of quizzes) {
    let courseInfo = null;
    if (q.course) {
      courseInfo = await db.collection('courses').findOne({ _id: q.course });
    }
    console.log(`\nQuiz ID: ${q._id}`);
    console.log(`  Title: ${q.title}`);
    console.log(`  isActive: ${q.isActive}`);
    console.log(`  Questions count: ${q.questions ? q.questions.length : 0}`);
    console.log(`  Course ID: ${q.course}`);
    if (courseInfo) {
      console.log(`  Course Title: ${courseInfo.title}`);
      console.log(`  Course Dept: ${courseInfo.department}`);
      console.log(`  Course Level: ${courseInfo.level}`);
      console.log(`  Course Path: ${courseInfo.path}`);
    } else {
      console.log(`  Course Title: [NOT FOUND OR NULL]`);
    }
  }

  mongoose.disconnect();
});
