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

  if (!frontendCourse) {
    console.error('FRONTEND WEB DEVELOPMENT course not found');
    process.exit(1);
  }

  const email = 'danieleneluwe@gmail.com';
  const student = await db.collection('students').findOne({ email: email.toLowerCase().trim() });

  if (!student) {
    console.error(`Student with email ${email} not found`);
    process.exit(1);
  }

  console.log(`Granting FRONTEND WEB DEVELOPMENT access to: ${student.fullName || student.email} [ID: ${student._id}]`);

  await db.collection('courseaccesses').updateOne(
    { student: student._id, course: frontendCourse._id },
    {
      $set: {
        student: student._id,
        course: frontendCourse._id,
        isActive: true,
        isUsed: true,
        firstUsedAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log('✅ Access successfully granted to Daniel Eneluwe!');

  // Verification: list all students currently having active access to FRONTEND WEB DEVELOPMENT
  const accesses = await db.collection('courseaccesses').find({
    course: frontendCourse._id,
    isActive: true
  }).toArray();

  console.log(`\n--- CURRENT FRONTEND WEB DEVELOPMENT ACCESS LIST (${accesses.length}) ---`);
  for (const a of accesses) {
    const s = await db.collection('students').findOne({ _id: a.student });
    console.log(` ✅ ${s ? (s.fullName || s.email) + ' (' + s.email + ')' : a.student}`);
  }

  mongoose.disconnect();
});
