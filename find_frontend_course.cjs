require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  console.log('=== CHECKING SWD COURSES ===');
  const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004');

  const courses = await db.collection('courses').find({
    $or: [
      { department: swdDeptId },
      { title: /frontend/i },
      { title: /web/i },
      { title: /html/i }
    ]
  }).toArray();

  courses.forEach(c => {
    console.log(`Course ID: ${c._id} | Code: ${c.courseCode} | Title: "${c.title}" | Dept: ${c.department} | Level: ${c.level} | Semester: ${c.semester}`);
  });

  mongoose.disconnect();
});
