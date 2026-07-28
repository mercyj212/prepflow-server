const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Course = require('./models/Course');
const CourseNote = require('./models/CourseNote');

async function check() {
  const gnsCourse = await Course.findOne({ courseCode: /GNS/i });
  console.log('GNS Course in DB:', gnsCourse ? `${gnsCourse.courseCode} - ${gnsCourse.title} (ID: ${gnsCourse._id})` : 'Not found');

  if (gnsCourse) {
      const notes = await CourseNote.find({ courseId: gnsCourse._id });
      console.log(`Found ${notes.length} notes for courseId ${gnsCourse._id}`);
      notes.forEach(n => console.log(` - ${n.chapterTitle}`));
  }

  const allNotes = await CourseNote.find({}, 'courseId chapterTitle');
  console.log(`\nTotal notes in DB: ${allNotes.length}`);
  
  // check if any note has GNS in chapter title
  const gnsNotes = allNotes.filter(n => n.chapterTitle && n.chapterTitle.includes('GNS'));
  console.log(`Notes with GNS in title: ${gnsNotes.length}`);
  for (let n of gnsNotes) {
      const c = await Course.findById(n.courseId);
      console.log(` - ${n.chapterTitle} mapped to course: ${c ? c.courseCode : 'Unknown'} (ID: ${n.courseId})`);
  }
  
  process.exit();
}

check();
