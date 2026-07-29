const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;

  const depts = await db.collection('departments').find({}).toArray();
  console.log('All Departments:', depts.map(d => ({ id: d._id.toString(), name: d.name })));

  for (const dept of depts) {
    const courses = await db.collection('courses').find({ department: dept._id }).toArray();
    console.log(`\nDepartment: ${dept.name}`);
    console.log(`Total Courses: ${courses.length}`);
    for (const c of courses) {
      const quizzes = await db.collection('quizzes').find({ course: c._id }).toArray();
      console.log(`  Course: "${c.title}" | Level: "${c.level}" | Quizzes: ${quizzes.length}`);
    }
  }

  process.exit(0);
}).catch(console.error);
