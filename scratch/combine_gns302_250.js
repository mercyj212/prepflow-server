import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

// Load raw 100 questions from handwritten notes
import { rawGns302Questions } from './seed_gns302_100_data.js';

// Load 150 questions from exam set
import { questions150 } from './seed_gns302_150_data.js';

async function combine250GNS302() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for 250 GNS 302 Questions Seeding...");

    // Format 100 handwritten notes questions to Mongoose schema
    const formatted100 = rawGns302Questions.map(q => ({
      text: q.questionText || q.text,
      options: (q.options || []).map(opt => ({
        text: typeof opt === 'string' ? opt : opt.text,
        isCorrect: typeof opt === 'string' ? opt === q.correctAnswer : Boolean(opt.isCorrect)
      })),
      explanation: q.explanation || ''
    }));

    // Combine both arrays (100 + 150 = 250)
    const combined250 = [...formatted100, ...questions150];

    console.log(`Total combined questions: ${combined250.length}`);

    // Canonical School of ICT Faculty
    const canonicalFaculty = await Faculty.findOne({ name: /School of ICT/i });
    if (!canonicalFaculty) {
      throw new Error("Canonical 'School of ICT' faculty not found!");
    }

    const targetDepts = [
      "Software and Web Development",
      "Artificial Intelligence",
      "Networking and Cloud Computing",
      "Cyber Security"
    ];

    let updatedQuizzes = 0;

    for (const deptName of targetDepts) {
      const dept = await Department.findOne({
        faculty: canonicalFaculty._id,
        name: new RegExp(deptName, 'i')
      });

      if (!dept) {
        console.error(`Could not find department for ${deptName}`);
        continue;
      }

      // Find GNS 302 course
      let course = await Course.findOne({
        department: dept._id,
        $or: [
          { code: /GNS\s*302/i },
          { title: new RegExp(`COMMUNICATION SKILLS & LOGIC`, 'i') }
        ]
      });

      if (!course) {
        course = await Course.create({
          title: `Communication Skills & Logic - ${deptName}`,
          code: "GNS 302",
          description: "Comprehensive HND1 Communication Skills, Grammar, Concord, Tenses, Logic, Argumentation, Essay Writing, and Literary Genres.",
          department: dept._id,
          faculty: canonicalFaculty._id,
          level: "HND1",
          semester: "Second Semester",
          path: "polytechnic",
          price: 1000,
          isPaid: true
        });
        console.log(`Created GNS 302 course for ${deptName}`);
      }

      // Update or Create Quiz with all 250 questions
      let quiz = await Quiz.findOne({ course: course._id });
      if (!quiz) {
        quiz = await Quiz.create({
          title: `GNS 302 CBT Practice Test - ${deptName}`,
          description: "Comprehensive 250-question master pool for GNS 302 (Communication Skills & Logic). 60 questions shuffled per 30-minute attempt.",
          course: course._id,
          questions: combined250,
          timeLimit: 30,
          isActive: true
        });
        console.log(`Created Quiz for ${deptName} with 250 questions!`);
      } else {
        quiz.questions = combined250;
        quiz.title = `GNS 302 CBT Practice Test - ${deptName}`;
        quiz.description = "Comprehensive 250-question master pool for GNS 302 (Communication Skills & Logic). 60 questions shuffled per 30-minute attempt.";
        await quiz.save();
        console.log(`Updated Quiz for ${deptName} with all 250 questions!`);
      }

      updatedQuizzes++;
    }

    console.log("\n=======================================================");
    console.log(`✅ Success! Updated ${updatedQuizzes} GNS 302 quizzes with 250 master questions.`);
    console.log("✅ Departments covered: SWD, AI, NCC, CYS.");
    console.log("=======================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

combine250GNS302();
