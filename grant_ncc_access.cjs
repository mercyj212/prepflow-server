const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  
  const email = 'nnazobachristina@gmail.com';
  console.log(`Processing access for: ${email}`);
  
  const student = await db.collection('students').findOne({ email: new RegExp(email, 'i') });
  
  if (!student) {
    console.log('User not found.');
    process.exit(0);
  }
  
  console.log('Found user:', student.email, 'Name:', student.fullName);
  
  // Find NCC Department
  const nccDept = await db.collection('departments').findOne({ 
    $or: [
      { name: /networking/i },
      { name: /ncc/i }
    ] 
  });

  const nccDeptId = nccDept ? nccDept._id : null;
  console.log('NCC Department ID:', nccDeptId ? nccDeptId.toString() : 'None');

  // Find all NCC courses (by department OR title/code containing NCC / Cloud / Networking)
  const nccCourses = await db.collection('courses').find({ 
    $or: [
      { department: nccDeptId },
      { code: /ncc/i },
      { title: /networking/i },
      { title: /cloud/i },
      { title: /ncc/i }
    ]
  }).toArray();
  
  console.log(`Found ${nccCourses.length} NCC courses:`, nccCourses.map(c => (c.code || '') + ' - ' + c.title));
  const nccCourseIds = new Set(nccCourses.map(c => c._id.toString()));

  // Remove non-NCC course access entries for this student so they ONLY have access to NCC courses
  const deleteRes = await db.collection('courseaccesses').deleteMany({
    student: student._id,
    course: { $nin: nccCourses.map(c => c._id) }
  });
  console.log(`Removed ${deleteRes.deletedCount} non-NCC course access records.`);

  // Find existing accesses for NCC courses
  const existingAccesses = await db.collection('courseaccesses').find({ student: student._id }).toArray();
  const existingCourseIds = new Set(existingAccesses.map(a => a.course.toString()));
  
  let granted = 0;
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
      granted++;
    }
  }
  
  console.log(`Granted access to ${granted} new NCC courses.`);
  
  // Final verification of user's accesses
  const finalAccesses = await db.collection('courseaccesses').aggregate([
    { $match: { student: student._id, isActive: true } },
    { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseInfo' } }
  ]).toArray();

  console.log('\nFinal Course Accesses for user:');
  finalAccesses.forEach(a => {
    const c = a.courseInfo[0];
    console.log(`- ${c ? c.title : a.course}`);
  });

  process.exit(0);
}).catch(console.error);
