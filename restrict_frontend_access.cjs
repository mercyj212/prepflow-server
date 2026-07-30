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

  // Allowed student emails
  const allowedEmails = [
    'jaymercy510@gmail.com',
    'franklinpeter2020@gmail.com',
    'ebubeonuorahobi@gmail.com'
  ];

  console.log(`Frontend Course ID: ${frontendCourse._id}`);
  console.log(`Allowed Student Emails: ${allowedEmails.join(', ')}`);

  // Find students by email
  const allowedStudents = await db.collection('students').find({
    email: { $in: allowedEmails }
  }).toArray();

  const allowedStudentIds = allowedStudents.map(s => s._id);

  console.log(`Found ${allowedStudents.length} matching allowed student records:`);
  allowedStudents.forEach(s => console.log(` - ${s.fullName || s.email} [ID: ${s._id}]`));

  // Delete Frontend course access for anyone NOT in the allowed list
  const deleteRes = await db.collection('courseaccesses').deleteMany({
    course: frontendCourse._id,
    student: { $nin: allowedStudentIds }
  });

  console.log(`\n✅ Removed Frontend Web Development access from ${deleteRes.deletedCount} unapproved student(s).`);

  // Ensure active access for the 3 allowed students
  for (const sId of allowedStudentIds) {
    await db.collection('courseaccesses').updateOne(
      { student: sId, course: frontendCourse._id },
      {
        $set: {
          student: sId,
          course: frontendCourse._id,
          isActive: true,
          isUsed: true,
          firstUsedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  // Verification
  const currentAccesses = await db.collection('courseaccesses').find({
    course: frontendCourse._id,
    isActive: true
  }).toArray();

  console.log(`\n--- VERIFICATION: CURRENT FRONTEND ACCESS LIST (${currentAccesses.length}) ---`);
  for (const a of currentAccesses) {
    const student = await db.collection('students').findOne({ _id: a.student });
    console.log(` ✅ ${student ? student.fullName + ' (' + student.email + ')' : a.student}`);
  }

  mongoose.disconnect();
});
