require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const courseNoteSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    chapterTitle: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const CourseNote = mongoose.models.CourseNote || mongoose.model("CourseNote", courseNoteSchema);

async function main() {
  try {
    const logContent = fs.readFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\18554234-30f9-4c6f-9f44-95786711a437\\.system_generated\\tasks\\task-5883.log', 'utf8');
    const jsonStart = logContent.indexOf('[');
    const jsonEnd = logContent.lastIndexOf(']') + 1;
    const jsonStr = logContent.substring(jsonStart, jsonEnd);
    
    let notesData;
    try {
      notesData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON from log!");
      process.exit(1);
    }
    
    console.log(`Parsed ${notesData.length} chapters.`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const courses = await db.collection('courses').find({ title: /CYS 322/i }).toArray();
    console.log(`Found ${courses.length} CYS 322 courses in database.`);

    for (const course of courses) {
      console.log(`Replacing notes for course: ${course.title}...`);
      await CourseNote.deleteMany({ course: course._id });
      
      let order = 1;
      for (const note of notesData) {
        await CourseNote.create({
          course: course._id,
          chapterTitle: note.chapterTitle,
          content: note.content,
          order: order++
        });
      }
    }

    console.log('Successfully updated notes from log!');
    process.exit(0);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

main();
