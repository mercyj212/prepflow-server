const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const courses = await db.collection('courses').find({ code: /cys/i }).toArray();
  console.log('Courses matching CYS:', courses.map(c => c.code + ' - ' + c.title));
  
  const notes = await db.collection('notes').find({}).toArray();
  const cysNotes = notes.filter(n => courses.some(c => c._id.toString() === n.course?.toString()));
  console.log('CYS Notes:', cysNotes.map(n => n.chapterTitle));
  
  const users = await db.collection('users').find({ $or: [{ username: /jaymercy/i }, { email: /jaymercy/i }] }).toArray();
  console.log('Users matching jaymercy:', users.map(u => ({ email: u.email, hasAccess: u.hasAccess })));
  
  // Give Jaymercy access
  if (users.length > 0) {
    await db.collection('users').updateOne({ _id: users[0]._id }, { $set: { hasAccess: true } });
    console.log('Granted access to', users[0].email);
  } else {
    console.log('User jaymercy not found');
  }
  
  process.exit();
}).catch(console.error);
