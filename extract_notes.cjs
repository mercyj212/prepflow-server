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
    
    const chapters = [];
    
    // The format is roughly:
    // "chapterTitle": "...",
    // "content": "# Chapter..."
    // ending before the next "chapterTitle" or the end of the array.
    
    const titleRegex = /"chapterTitle":\s*"([^"]+)"/g;
    let match;
    const titleMatches = [];
    while ((match = titleRegex.exec(logContent)) !== null) {
      titleMatches.push({ title: match[1], index: match.index });
    }
    
    for (let i = 0; i < titleMatches.length; i++) {
      const current = titleMatches[i];
      const nextIndex = i + 1 < titleMatches.length ? titleMatches[i+1].index : logContent.lastIndexOf('}');
      
      const chunk = logContent.substring(current.index, nextIndex);
      
      const contentMatch = chunk.match(/"content":\s*"([\s\S]*?)"\n\s*\}/);
      if (contentMatch) {
        // Unescape standard JSON escapes that might be in the content
        let content = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        chapters.push({
          chapterTitle: current.title,
          content: content
        });
      }
    }
    
    console.log(`Parsed ${chapters.length} chapters manually.`);
    if (chapters.length === 0) {
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const courses = await db.collection('courses').find({ title: /CYS 322/i }).toArray();
    console.log(`Found ${courses.length} CYS 322 courses in database.`);

    for (const course of courses) {
      console.log(`Replacing notes for course: ${course.title}...`);
      await CourseNote.deleteMany({ course: course._id });
      
      let order = 1;
      for (const note of chapters) {
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
