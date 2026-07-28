
import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://prepflow:Prepflow4801@cluster0.vjeopgu.mongodb.net/prepflow?retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const coursenotes = db.collection('coursenotes');

  const eedSrc = '6a611d48f215e13ef46b5398';
  const eedTargets = [
    '6a611d4af215e13ef46b5b74',
    '6a611d49f215e13ef46b5786',
    '6a611d4bf215e13ef46b5f62'
  ];

  const gnsSrc = '6a618371ca89f77de8bb2e31';
  const gnsTargets = [
    '6a618373ca89f77de8bb3229',
    '6a618372ca89f77de8bb302d',
    '6a618374ca89f77de8bb3425'
  ];

  const duplicateNotes = async (srcId, targetIds) => {
    const srcNotes = await coursenotes.find({ course: new mongoose.Types.ObjectId(srcId) }).toArray();
    for (const note of srcNotes) {
      for (const targetId of targetIds) {
        const targetObjectId = new mongoose.Types.ObjectId(targetId);
        const exists = await coursenotes.findOne({ course: targetObjectId, chapterTitle: note.chapterTitle });
        if (!exists) {
          const newNote = {
            course: targetObjectId,
            chapterTitle: note.chapterTitle,
            content: note.content,
            videoUrl: note.videoUrl,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await coursenotes.insertOne(newNote);
          console.log('Copied note to course ' + targetId);
        } else {
          console.log('Skip note already in course ' + targetId);
        }
      }
    }
  };

  await duplicateNotes(eedSrc, eedTargets);
  await duplicateNotes(gnsSrc, gnsTargets);

  console.log('Duplication complete.');
  process.exit(0);
});

