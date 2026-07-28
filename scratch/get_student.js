
import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const students = await db.collection('students').find({ email: /mercy/i }).toArray();
  for (const s of students) {
    console.log('Student:', s.email, s._id, s.fullName);
  }
  process.exit(0);
});

