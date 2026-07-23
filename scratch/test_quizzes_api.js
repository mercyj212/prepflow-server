import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Department from '../models/Department.js';

dotenv.config();

async function testQuizzesApi() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const dept = await Department.findOne({ name: /Software and Web Development/i });
    console.log(`SWD Department ID: ${dept._id}`);

    const courses = await Course.find({ department: dept._id });
    console.log(`Courses found for SWD (${courses.length}):`);
    courses.forEach(c => console.log(` - ID: ${c._id} | Title: "${c.title}" | Level: ${c.level}`));

    const coursePopulate = {
      path: "course",
      select: "title level path department",
      populate: {
        path: "department",
        select: "name faculty",
        populate: { path: "faculty", select: "name path" },
      },
    };

    const quizzes = await Quiz.find({ isActive: true }).populate(coursePopulate);
    console.log(`\nTotal Quizzes in DB: ${quizzes.length}`);

    const courseIds = courses.map(c => c._id.toString());
    const matchedQuizzes = quizzes.filter(q => {
      const qCourseId = (q.course?._id || q.course)?.toString();
      return courseIds.includes(qCourseId);
    });

    console.log(`Matched Quizzes for SWD (${matchedQuizzes.length}):`);
    matchedQuizzes.forEach(q => console.log(` - Quiz ID: ${q._id} | Title: "${q.title}" | Course: ${q.course?.title}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testQuizzesApi();
