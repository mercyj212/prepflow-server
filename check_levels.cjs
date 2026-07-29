const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  
  console.log('\n=== COURSE LEVEL DISTRIBUTION ===');
  const courses = await db.collection('courses').find({}).toArray();
  
  // Group by level
  const levelGroups = {};
  courses.forEach(c => {
    const level = c.level || 'NULL (no level)';
    if (!levelGroups[level]) levelGroups[level] = [];
    levelGroups[level].push({ title: c.title, path: c.path, semester: c.semester });
  });
  
  Object.keys(levelGroups).sort().forEach(level => {
    console.log(`\n[${level}] — ${levelGroups[level].length} courses:`);
    levelGroups[level].forEach(c => {
      console.log(`  • ${c.title} (path: ${c.path}, semester: ${c.semester})`);
    });
  });

  console.log('\n=== POLYTECHNIC COURSES SUMMARY ===');
  const polyCourses = courses.filter(c => c.path === 'polytechnic');
  console.log(`Total polytechnic courses: ${polyCourses.length}`);
  
  const polyLevelGroups = {};
  polyCourses.forEach(c => {
    const level = c.level || 'NULL';
    if (!polyLevelGroups[level]) polyLevelGroups[level] = 0;
    polyLevelGroups[level]++;
  });
  console.log('Level breakdown:', polyLevelGroups);

  console.log('\n=== QUIZ LEVEL CHECK ===');
  const quizzes = await db.collection('quizzes').find({}).toArray();
  console.log(`Total quizzes: ${quizzes.length}`);
  const quizLevelGroups = {};
  quizzes.forEach(q => {
    const level = q.level || 'NO LEVEL FIELD';
    if (!quizLevelGroups[level]) quizLevelGroups[level] = 0;
    quizLevelGroups[level]++;
  });
  console.log('Quiz level breakdown:', quizLevelGroups);

  process.exit();
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});
