import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const CourseNote = mongoose.model('CourseNote', new mongoose.Schema({}, {strict: false}), 'coursenotes');
  const gnsNote = await CourseNote.findOne({ chapterTitle: /GNS/i }).lean();
  console.log('GNS Note Course type:', typeof gnsNote.course);
  console.log('GNS Note Course constructor:', gnsNote.course.constructor.name);
  console.log(gnsNote);
  
  const eedNote = await CourseNote.findOne({ chapterTitle: /EED/i }).lean();
  console.log('EED Note Course type:', typeof eedNote.course);
  console.log('EED Note Course constructor:', eedNote.course.constructor.name);
  console.log(eedNote);

  process.exit(0);
});
