require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  console.log('=== DETAILED STUDENTS & ACCESS RECORDS ===');

  const accessList = await db.collection('courseaccesses').find({ isActive: true }).toArray();
  const studentIds = [...new Set(accessList.map(a => a.student.toString()))];

  for (const sId of studentIds) {
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(sId) });
    const accesses = accessList.filter(a => a.student.toString() === sId);
    
    console.log(`\nStudent: "${user ? (user.name || user.fullName || user.email) : 'Unknown'}" | Email: "${user ? user.email : 'N/A'}" [ID: ${sId}]`);
    console.log(`  Access count: ${accesses.length}`);
  }

  // List all SWD courses
  const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004');
  const swdCourses = await db.collection('courses').find({ department: swdDeptId }).toArray();
  console.log(`\n=== SWD COURSES (${swdCourses.length}) ===`);
  swdCourses.forEach(c => console.log(` - [${c._id}] ${c.title}`));

  mongoose.disconnect();
});
