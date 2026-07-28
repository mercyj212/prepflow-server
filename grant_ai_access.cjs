const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  
  const email = 'Perryxau@gmail.com';
  console.log(`Checking access for: ${email}`);
  
  const student = await db.collection('students').findOne({ email: new RegExp(email, 'i') });
  
  if (!student) {
    console.log('User not found.');
    process.exit(0);
  }
  
  console.log('Found user:', student.email, student.fullName);
  
  // Find AI courses (assume code contains "AIT" or title contains "AI")
  const aiCourses = await db.collection('courses').find({ 
    $or: [
      { code: /ait/i },
      { title: /artificial intelligence/i }
    ]
  }).toArray();
  
  console.log(`Found ${aiCourses.length} AI courses:`, aiCourses.map(c => c.code + ' - ' + c.title));
  
  if (aiCourses.length === 0) {
    console.log('No AI courses found.');
    process.exit(0);
  }

  const existingAccesses = await db.collection('courseaccesses').find({ student: student._id }).toArray();
  const existingCourseIds = new Set(existingAccesses.map(a => a.course.toString()));
  let granted = 0;
  
  for (const c of aiCourses) {
    if (!existingCourseIds.has(c._id.toString())) {
      await db.collection('courseaccesses').insertOne({
          student: student._id,
          course: c._id,
          accessToken: 'auto-granted-ai-' + Date.now() + '-' + Math.random().toString(36).substring(7),
          isActive: true,
          isUsed: true,
          firstUsedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
      });
      granted++;
    }
  }
  
  console.log(`Granted access to ${granted} new AI courses.`);
  process.exit();
}).catch(console.error);
