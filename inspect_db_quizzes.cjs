require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const dbCourseId = new mongoose.Types.ObjectId('69e2146d67e00d9c07c51d5a');

  console.log('Course Details:');
  const course = await db.collection('courses').findOne({ _id: dbCourseId });
  console.log(course);

  console.log('\nSample Quizzes linked to this course ID:');
  const quizzes = await db.collection('quizzes').find({ course: dbCourseId }).limit(10).toArray();
  console.log(quizzes);

  const totalLinked = await db.collection('quizzes').countDocuments({ course: dbCourseId });
  console.log(`Total quiz docs linked to course: ${totalLinked}`);

  mongoose.disconnect();
});
