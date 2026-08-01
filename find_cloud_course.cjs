require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const nccDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc55600a'); // NCC Department

  console.log('=== NCC DEPARTMENT COURSES ===');
  const nccCourses = await db.collection('courses').find({
    $or: [
      { department: nccDeptId },
      { title: /cloud/i }
    ]
  }).toArray();

  nccCourses.forEach(c => {
    console.log(`ID: ${c._id} | Code: ${c.courseCode} | Title: "${c.title}" | Dept: ${c.department} | Level: ${c.level} | Semester: ${c.semester}`);
  });

  mongoose.disconnect();
});
