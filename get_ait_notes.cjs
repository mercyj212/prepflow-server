require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const courses = await db.collection('courses').find({ code: /AIT/i }).toArray();
  console.log('Found courses:', courses.map(c => ({ id: c._id, code: c.code, title: c.title })));
  
  for (const course of courses) {
    const note = await db.collection('coursenotes').findOne({ course: course._id });
    if (note) {
      require('fs').writeFileSync(`ait_chapters_${course.code.replace(/\s+/g, '')}.json`, JSON.stringify({
        _id: note._id,
        chapters: note.chapters
      }, null, 2));
      console.log(`Saved notes for ${course.code}`);
    }
  }
  
  process.exit(0);
}

main().catch(console.error);
