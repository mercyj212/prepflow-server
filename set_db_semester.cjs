require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const dbCourseId = new mongoose.Types.ObjectId('69e2146d67e00d9c07c51d5a');

  const result = await db.collection('courses').updateOne(
    { _id: dbCourseId },
    { $set: { semester: 'Second Semester' } }
  );

  console.log(result.modifiedCount === 1 ? '✅ Semester updated to Second Semester' : '⚠️ No change made');

  const course = await db.collection('courses').findOne({ _id: dbCourseId });
  console.log(`Course Title: ${course.title}`);
  console.log(`Department:   ${course.department}`);
  console.log(`Level:        ${course.level}`);
  console.log(`Semester:     ${course.semester}`);

  mongoose.disconnect();
});
