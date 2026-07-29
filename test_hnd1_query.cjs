const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;

  const depts = await db.collection('departments').find({}).toArray();

  for (const dept of depts) {
    const courseFilter = {
      $or: [{ department: dept._id }, { department: null }],
      level: 'HND1'
    };
    const courses = await db.collection('courses').find(courseFilter).toArray();
    console.log(`Department: ${dept.name} | HND1 Courses Count: ${courses.length}`);
    courses.forEach(c => console.log(`  - ${c.title} (Level: ${c.level})`));
  }

  process.exit(0);
}).catch(console.error);
