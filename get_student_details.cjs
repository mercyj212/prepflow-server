require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  console.log('=== LIST OF STUDENTS WITH COURSE ACCESS ===\n');

  const accessList = await db.collection('courseaccesses').find({ isActive: true }).toArray();
  const studentIds = [...new Set(accessList.map(a => a.student.toString()))];

  const studentsInfo = [];

  for (const sIdStr of studentIds) {
    const sId = new mongoose.Types.ObjectId(sIdStr);
    const student = await db.collection('students').findOne({ _id: sId });
    const user = student || await db.collection('users').findOne({ _id: sId });

    const studentAccesses = accessList.filter(a => a.student.toString() === sIdStr);

    studentsInfo.push({
      id: sIdStr,
      fullName: user ? (user.fullName || user.name || 'N/A') : 'N/A',
      email: user ? user.email : 'N/A',
      phone: user ? (user.phone || 'N/A') : 'N/A',
      role: user ? (user.role || 'student') : 'N/A',
      coursesCount: studentAccesses.length
    });
  }

  console.table(studentsInfo);

  mongoose.disconnect();
});
