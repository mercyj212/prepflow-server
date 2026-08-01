require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004'); // SWD Department

  console.log('=== SWD DEPARTMENT COURSES ===');
  const swdCourses = await db.collection('courses').find({
    $or: [
      { department: swdDeptId },
      { title: /backend/i }
    ]
  }).toArray();

  swdCourses.forEach(c => {
    console.log(`ID: ${c._id} | Code: ${c.courseCode} | Title: "${c.title}" | Dept: ${c.department} | Level: ${c.level} | Semester: ${c.semester}`);
  });

  mongoose.disconnect();
});
