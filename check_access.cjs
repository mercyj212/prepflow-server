const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  
  const email = 'nnazobachristina@gmail.com';
  console.log(`Checking access for: ${email}`);
  
  const student = await db.collection('students').findOne({ email: new RegExp(email, 'i') });
  
  if (!student) {
    console.log('User not found.');
    process.exit(0);
  }
  
  console.log('Found user:', student.email, student.fullName);
  
  const courses = await db.collection('courses').find({}).toArray();
  const existingAccesses = await db.collection('courseaccesses').find({ student: student._id }).toArray();
  
  console.log(`User has access to ${existingAccesses.length} out of ${courses.length} courses.`);
  
  if (existingAccesses.length < courses.length) {
    console.log('Granting access to missing courses...');
    const existingCourseIds = new Set(existingAccesses.map(a => a.course.toString()));
    let granted = 0;
    
    for (const c of courses) {
      if (!existingCourseIds.has(c._id.toString())) {
        await db.collection('courseaccesses').insertOne({
           student: student._id,
           course: c._id,
           accessToken: 'auto-granted-' + Date.now() + '-' + Math.random().toString(36).substring(7),
           isActive: true,
           isUsed: true,
           firstUsedAt: new Date(),
           createdAt: new Date(),
           updatedAt: new Date()
        });
        granted++;
      }
    }
    console.log(`Granted access to ${granted} additional courses.`);
  } else {
    console.log('User already has full access to all courses.');
  }
  
  process.exit();
}).catch(console.error);
