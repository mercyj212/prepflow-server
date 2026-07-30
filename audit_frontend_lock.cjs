require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const frontendCourse = await db.collection('courses').findOne({
    $or: [
      { title: 'FRONTEND WEB DEVELOPMENT' },
      { title: 'FRONTEND DEVELOPMENT' }
    ]
  });

  console.log('=== FRONTEND COURSE SECURITY & ACCESS AUDIT ===\n');
  console.log(`Course Title: ${frontendCourse.title}`);
  console.log(`Course ID:    ${frontendCourse._id}`);
  console.log(`Course Price: ₦${frontendCourse.price}`);

  // Count active access records for this course
  const accesses = await db.collection('courseaccesses').find({
    course: frontendCourse._id,
    isActive: true
  }).toArray();

  console.log(`\nActive Access Records Count: ${accesses.length}`);
  
  for (const a of accesses) {
    const student = await db.collection('students').findOne({ _id: a.student });
    console.log(`  🟢 UNLOCKED: ${student ? student.fullName + ' (' + student.email + ')' : a.student}`);
  }

  // Count total students in system
  const totalStudents = await db.collection('students').countDocuments({});
  console.log(`\nTotal Registered Students in System: ${totalStudents}`);
  console.log(`Locked Students (Must pay ₦1,000 to access): ${totalStudents - accesses.length}`);

  mongoose.disconnect();
});
