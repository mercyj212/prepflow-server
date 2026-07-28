
import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const courseAccess = db.collection('courseaccesses');
  
  const studentId = new mongoose.Types.ObjectId('69cc7b65039db582ef09ba8a');
  const courseId = new mongoose.Types.ObjectId('6a61df22d1630e01349aae83');
  const token = 'TOKEN-' + Math.random().toString(36).substring(2, 15);
  
  try {
    await courseAccess.insertOne({
      student: studentId,
      course: courseId,
      accessToken: token,
      isActive: true,
      isUsed: false,
      firstUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Access granted successfully');
  } catch (err) {
    if (err.code === 11000) {
      console.log('User already has access to this course');
    } else {
      console.error(err);
    }
  }
  process.exit(0);
});

