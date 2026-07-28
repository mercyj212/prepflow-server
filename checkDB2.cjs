const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  
  // Find jaymercy
  const students = await db.collection('students').find({ $or: [{ nickname: /jaymercy/i }, { email: /jaymercy/i }, { fullName: /jaymercy/i }] }).toArray();
  console.log('Students matching jaymercy:', students.map(s => s.email + ' - ' + s.nickname));
  
  // See what coursenotes exist that might be for CYS 322
  const cysNotes = await db.collection('coursenotes').find({ $or: [{ chapterTitle: /mobile/i }, { chapterTitle: /wireless/i }, { chapterTitle: /cys/i }, { content: /cys 322/i }] }).toArray();
  console.log('CourseNotes matching CYS or mobile:', cysNotes.map(n => ({ id: n._id, title: n.chapterTitle, courseId: n.course, contentLength: n.content?.length })));
  
  // Find the CYS 322 courses again just to be sure
  const courses = await db.collection('courses').find({ code: /cys/i }).toArray();
  console.log('CYS Courses IDs:', courses.map(c => c._id));
  
  // Check if we need to grant access
  if (students.length > 0) {
    const studentId = students[0]._id;
    for (const c of courses) {
       const existingAccess = await db.collection('courseaccesses').findOne({ student: studentId, course: c._id });
       if (!existingAccess) {
          console.log(`Granting access to course ${c._id} for ${students[0].email}`);
          await db.collection('courseaccesses').insertOne({
             student: studentId,
             course: c._id,
             accessToken: 'auto-granted-' + Date.now(),
             isActive: true,
             isUsed: true,
             firstUsedAt: new Date(),
             createdAt: new Date(),
             updatedAt: new Date()
          });
       } else {
          console.log(`User already has access to course ${c._id}`);
       }
    }
  }
  
  process.exit();
}).catch(console.error);
