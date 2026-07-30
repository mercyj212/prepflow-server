require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

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

  console.log(`Frontend Course ID: ${frontendCourse._id}`);

  // Find all students with any active course access
  const allAccesses = await db.collection('courseaccesses').find({ isActive: true }).toArray();
  const studentIds = [...new Set(allAccesses.map(a => a.student.toString()))];

  console.log(`Found ${studentIds.length} students with existing course access.`);

  let addedCount = 0;
  for (const sIdStr of studentIds) {
    const sId = new mongoose.Types.ObjectId(sIdStr);

    const existingFrontendAccess = await db.collection('courseaccesses').findOne({
      student: sId,
      course: frontendCourse._id
    });

    if (!existingFrontendAccess) {
      const accessToken = crypto.randomBytes(16).toString('hex');
      await db.collection('courseaccesses').insertOne({
        student: sId,
        course: frontendCourse._id,
        accessToken: accessToken,
        isActive: true,
        isUsed: true,
        firstUsedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      addedCount++;
      console.log(`  + Granted FRONTEND WEB DEVELOPMENT access to Student [ID: ${sIdStr}]`);
    } else {
      // Ensure isActive is true
      await db.collection('courseaccesses').updateOne(
        { _id: existingFrontendAccess._id },
        { $set: { isActive: true } }
      );
    }
  }

  console.log(`\n✅ Successfully granted Frontend Web Development access to ${addedCount} student(s)!`);

  // Verification
  const totalFrontendAccess = await db.collection('courseaccesses').countDocuments({
    course: frontendCourse._id,
    isActive: true
  });
  console.log(`Total students now having active access to FRONTEND WEB DEVELOPMENT: ${totalFrontendAccess}`);

  mongoose.disconnect();
});
