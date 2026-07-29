const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  
  const nccDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc55600a');
  
  // Update AIT 313 to NCC Department
  const updateRes = await db.collection('courses').updateOne(
    { title: /ait 313/i },
    { $set: { department: nccDeptId } }
  );
  console.log('AIT 313 department set to NCC:', updateRes.modifiedCount);

  // Update student nnazobachristina@gmail.com access to include AIT 313
  const email = 'nnazobachristina@gmail.com';
  const student = await db.collection('students').findOne({ email: new RegExp(email, 'i') });

  if (student) {
    const aitCourse = await db.collection('courses').findOne({ title: /ait 313/i });
    if (aitCourse) {
      const existing = await db.collection('courseaccesses').findOne({ student: student._id, course: aitCourse._id });
      if (!existing) {
        await db.collection('courseaccesses').insertOne({
          student: student._id,
          course: aitCourse._id,
          accessToken: 'auto-granted-ncc-' + Date.now(),
          isActive: true,
          isUsed: true,
          firstUsedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Granted AIT 313 access to ${email}.`);
      }
    }

    // Verify all course accesses for student
    const finalAccesses = await db.collection('courseaccesses').aggregate([
      { $match: { student: student._id, isActive: true } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseInfo' } }
    ]).toArray();

    console.log(`\nUpdated Course Accesses for ${email}:`);
    finalAccesses.forEach(a => {
      const c = a.courseInfo[0];
      console.log(`- ${c ? c.title : a.course}`);
    });
  }

  process.exit(0);
}).catch(console.error);
