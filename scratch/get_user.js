
import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  for (const u of users) {
    console.log('User:', u.username, u.email, u._id);
  }
  process.exit(0);
});

