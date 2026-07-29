const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  
  const aiDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556007');
  const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004');
  
  // Ensure Computer Vision is under AI department
  const cvRes = await db.collection('courses').updateOne(
    { title: /computer vision/i },
    { $set: { department: aiDeptId } }
  );
  console.log('Computer Vision department updated to AI:', cvRes.modifiedCount);

  // Ensure Python Programming is strictly under SWD department
  const pyRes = await db.collection('courses').updateOne(
    { title: /python programming/i },
    { $set: { department: swdDeptId } }
  );
  console.log('Python Programming department updated to SWD:', pyRes.modifiedCount);

  // Verify AI courses
  const aiCourses = await db.collection('courses').find({ department: aiDeptId }).toArray();
  console.log('\nCurrent AI Courses:', aiCourses.map(c => c.title));

  // Verify SWD courses
  const swdCourses = await db.collection('courses').find({ department: swdDeptId }).toArray();
  console.log('Current SWD Courses:', swdCourses.map(c => c.title));

  process.exit(0);
}).catch(console.error);
