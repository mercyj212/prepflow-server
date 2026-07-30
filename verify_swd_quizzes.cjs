require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004');

  // Find courses matching SWD dept & HND1 level
  const courses = await db.collection('courses').find({
    department: swdDeptId,
    level: 'HND1'
  }).toArray();

  console.log(`SWD HND1 Courses count: ${courses.length}`);
  courses.forEach(c => console.log(` - [${c._id}] ${c.title}`));

  const courseIds = courses.map(c => c._id);

  // Find active quizzes for these courses
  const quizzes = await db.collection('quizzes').find({
    course: { $in: courseIds },
    isActive: true
  }).toArray();

  console.log(`\nSWD HND1 Active Quizzes count: ${quizzes.length}`);
  quizzes.forEach(q => console.log(` ✅ Quiz: "${q.title}" | CourseID: ${q.course} | Questions: ${q.questions?.length}`));

  mongoose.disconnect();
});
