require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const email = 'danieleneluwe@gmail.com';
  const student = await db.collection('students').findOne({ email: email.toLowerCase().trim() });

  if (!student) {
    console.error(`Student with email ${email} not found`);
    process.exit(1);
  }

  const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004'); // Software and Web Development
  const swdCourses = await db.collection('courses').find({ department: swdDeptId }).toArray();

  console.log(`Granting access to ALL ${swdCourses.length} SWD courses for: ${student.fullName} (${student.email}) [ID: ${student._id}]\n`);

  for (const c of swdCourses) {
    const accessToken = crypto.randomBytes(16).toString('hex');
    await db.collection('courseaccesses').updateOne(
      { student: student._id, course: c._id },
      {
        $set: {
          student: student._id,
          course: c._id,
          accessToken: accessToken,
          isActive: true,
          isUsed: true,
          firstUsedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`  ✅ Granted access to: "${c.title}" [ID: ${c._id}]`);
  }

  console.log('\n--- VERIFICATION: DANIEL ENELUWE SWD ACCESS LIST ---');
  const userAccesses = await db.collection('courseaccesses').find({
    student: student._id,
    isActive: true
  }).toArray();

  for (const a of userAccesses) {
    const course = await db.collection('courses').findOne({ _id: a.course });
    console.log(` 🟢 Course: "${course ? course.title : a.course}"`);
  }

  mongoose.disconnect();
});
