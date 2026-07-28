
import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const updates = [
    { id: '6a625a8a67d6d1773da326e1', title: 'Introduction to Entrepreneurship' },
    { id: '6a625af64981475cdc943923', title: 'Personal Savings and Portfolio Investment' },
    { id: '6a625b204981475cdc943927', title: 'Entrepreneurship and Communication' },
    { id: '6a625b354981475cdc94392b', title: 'Self-Discipline' },
    { id: '6a625b514981475cdc94392f', title: 'Sources of Information for Entrepreneurship' },
    { id: '6a625b744981475cdc943933', title: 'Roles of Banks in SME Promotion' },
    { id: '6a625b8c4981475cdc943937', title: 'Entrepreneurship Creation and Management' }
  ];
  
  for (const u of updates) {
    await db.collection('coursenotes').updateOne(
      { _id: new mongoose.Types.ObjectId(u.id) },
      { $set: { chapterTitle: u.title } }
    );
    console.log('Updated', u.id, 'to', u.title);
  }
  process.exit(0);
});

