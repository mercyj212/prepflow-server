require('dotenv').config();
const mongoose = require('mongoose');

async function fixCourses() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await mongoose.connection.db.collection('courses').updateMany(
    { title: /CYS 322/i },
    { $set: { level: 'HND1', semester: 'Second Semester', path: 'polytechnic', code: 'CYS 322' } }
  );
  console.log('Updated courses:', res.modifiedCount);
  process.exit(0);
}

fixCourses();
