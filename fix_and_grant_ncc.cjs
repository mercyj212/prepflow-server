const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  
  const aiDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556007');
  const nccDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc55600a');
  
  // Fix AIT 313 department to AI
  await db.collection('courses').updateOne(
    { title: /ait 313/i },
    { $set: { department: aiDeptId } }
  );
  console.log('Fixed AIT 313 department to Artificial Intelligence.');

  const email = 'nnazobachristina@gmail.com';
  const student = await db.collection('students').findOne({ email: new RegExp(email, 'i') });
  
  if (!student) {
    console.log('User not found.');
    process.exit(0);
  }

  // Get strictly NCC courses (courses in NCC dept or having NETWORKING AND CLOUD COMPUTING in title)
  const nccCourses = await db.collection('courses').find({
    $or: [
      { department: nccDeptId },
      { title: /networking and cloud computing/i }
    ]
  }).toArray();

  console.log('\nStrict NCC Courses found:', nccCourses.map(c => c.title));

  // Revoke any access to non-NCC courses
  const deleteRes = await db.collection('courseaccesses').deleteMany({
    student: student._id,
    course: { $nin: nccCourses.map(c => c._id) }
  });
  console.log(`Revoked access to ${deleteRes.deletedCount} non-NCC courses.`);

  // Grant access to all NCC courses
  const existingAccesses = await db.collection('courseaccesses').find({ student: student._id }).toArray();
  const existingCourseIds = new Set(existingAccesses.map(a => a.course.toString()));

  for (const c of nccCourses) {
    if (!existingCourseIds.has(c._id.toString())) {
      await db.collection('courseaccesses').insertOne({
        student: student._id,
        course: c._id,
        accessToken: 'auto-granted-ncc-' + Date.now() + '-' + Math.random().toString(36).substring(7),
        isActive: true,
        isUsed: true,
        firstUsedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  // Final check
  const finalAccesses = await db.collection('courseaccesses').aggregate([
    { $match: { student: student._id, isActive: true } },
    { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseInfo' } }
  ]).toArray();

  console.log(`\nFinal Course Accesses for ${student.email}:`);
  finalAccesses.forEach(a => {
    const c = a.courseInfo[0];
    console.log(`- ${c ? c.title : a.course}`);
  });

  process.exit(0);
}).catch(console.error);
