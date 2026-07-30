require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  console.log('=== SEARCHING FOR DATABASE QUIZZES & COURSES ===');
  
  const dbCourses = await db.collection('courses').find({
    $or: [
      { title: /database/i },
      { title: /db/i }
    ]
  }).toArray();

  console.log(`Found ${dbCourses.length} database courses:`);
  for (const c of dbCourses) {
    console.log(`Course ID: ${c._id} | Code: ${c.courseCode} | Title: "${c.title}" | Dept: ${c.department} | Level: ${c.level}`);
    const quizzes = await db.collection('quizzes').find({ course: c._id }).toArray();
    console.log(`  Linked Quizzes (${quizzes.length}):`);
    quizzes.forEach(q => console.log(`    Quiz ID: ${q._id} | Title: "${q.title}" | Questions: ${q.questions?.length} | isActive: ${q.isActive}`));
  }

  // Also check all quizzes matching "database" in title
  const dbQuizzes = await db.collection('quizzes').find({
    title: /database/i
  }).toArray();
  console.log(`\nQuizzes with "database" in quiz title (${dbQuizzes.length}):`);
  for (const q of dbQuizzes) {
    console.log(`  Quiz ID: ${q._id} | Title: "${q.title}" | CourseID: ${q.course}`);
  }

  mongoose.disconnect();
});
