require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const courses = await db.collection('courses').find({}).toArray();
  console.log(`Total courses in DB: ${courses.length}`);
  courses.forEach(c => {
    console.log(`ID: ${c._id} | Title: "${c.title}" | Dept: ${c.department} | Level: ${c.level} | Semester: ${c.semester}`);
  });

  mongoose.disconnect();
});
