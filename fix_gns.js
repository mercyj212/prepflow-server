import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import CourseNote from './models/CourseNote.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

async function fixGNS() {
  // Find the existing GNS302 note
  const gnsNote = await CourseNote.findOne({ chapterTitle: 'GNS302' });
  if (!gnsNote) {
    console.log('GNS302 note not found in DB!');
    process.exit();
  }

  console.log(`Found GNS302 note: ${gnsNote._id}`);

  // Find all communication skills courses
  const gnsCourses = await Course.find({ title: /COMMUNICATION SKILLS/i });
  console.log(`Found ${gnsCourses.length} courses matching GNS`);

  for (const course of gnsCourses) {
    const existing = await CourseNote.findOne({ courseId: course._id, chapterTitle: 'GNS302' });
    if (existing) {
      console.log(`Note already exists for course: ${course.title} (${course._id})`);
    } else {
      const newNote = new CourseNote({
        course: course._id,
        courseTitle: course.title,
        chapterTitle: 'GNS 302',
        content: gnsNote.content,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newNote.save();
      console.log(`Created GNS note for course: ${course.title} (${course._id})`);
    }
  }

  process.exit();
}

fixGNS();
