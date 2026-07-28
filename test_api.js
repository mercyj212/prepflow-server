import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const CourseNote = mongoose.model('CourseNote', new mongoose.Schema({}, {strict: false}), 'coursenotes');
  
  // Test GNS course ID
  const courseId = '6a618371ca89f77de8bb2e31';
  const notes = await CourseNote.find({ course: courseId }).sort({ order: 1 }).lean();
  
  console.log(`Found ${notes.length} notes for course ${courseId}`);
  if (notes.length > 0) {
    console.log('Sample note chapterTitle:', notes[0].chapterTitle);
  } else {
    // If it didn't find it, let's try with ObjectId explicitly
    const notesWithObjectId = await CourseNote.find({ course: new mongoose.Types.ObjectId(courseId) }).lean();
    console.log(`With explicit ObjectId, found ${notesWithObjectId.length} notes`);
  }
  
  process.exit(0);
});
