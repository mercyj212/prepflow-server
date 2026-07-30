require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const dbCourseId = new mongoose.Types.ObjectId('69e2146d67e00d9c07c51d5a');

  // 1. Update Course semester to "Second Semester"
  const courseRes = await db.collection('courses').updateOne(
    { _id: dbCourseId },
    { $set: { semester: 'Second Semester' } }
  );

  console.log(courseRes.modifiedCount === 1 ? '✅ Course semester updated to "Second Semester"' : 'ℹ️ Course semester already "Second Semester"');

  // 2. Update Quiz timeLimit and duration to 30
  const quizRes = await db.collection('quizzes').updateOne(
    { course: dbCourseId },
    { $set: { timeLimit: 30, duration: 30 } }
  );

  console.log(quizRes.modifiedCount === 1 ? '✅ Quiz time limit updated to 30 minutes' : 'ℹ️ Quiz time limit already set');

  // Verification
  const course = await db.collection('courses').findOne({ _id: dbCourseId });
  const quiz = await db.collection('quizzes').findOne({ course: dbCourseId });

  console.log('\n--- VERIFICATION RESULTS ---');
  console.log(`Course Title: ${course.title}`);
  console.log(`Department:   Software and Web Development`);
  console.log(`Level:        ${course.level}`);
  console.log(`Semester:     ${course.semester}`);
  console.log(`Quiz Title:   ${quiz.title}`);
  console.log(`Time Limit:   ${quiz.timeLimit} minutes (duration: ${quiz.duration})`);

  mongoose.disconnect();
});
