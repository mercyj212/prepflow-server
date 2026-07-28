import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const courses = await mongoose.connection.db.collection('courses').find({}).toArray();
  courses.forEach(c => console.log(`ID: ${c._id}, Code: ${c.courseCode}, Title: ${c.title}`));
  process.exit();
});
