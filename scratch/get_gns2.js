
import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const courses = await db.collection('courses').find({ 
    title: /COMMUNICATION SKILLS & LOGIC/i
  }).toArray();
  
  for (const c of courses) {
    console.log('ID:', c._id, '| Title:', c.title);
  }
  process.exit(0);
});

