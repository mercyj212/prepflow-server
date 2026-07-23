import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import CourseAccess from '../models/CourseAccess.js';

dotenv.config();

async function cleanupDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for cleanup...");

    const orphanEED = "6a611d48f215e13ef46b5395";
    const orphanGNS = "6a6182b568bb12c0e30fc44a";

    // Delete orphan EED course
    const r1 = await Course.findByIdAndDelete(orphanEED);
    if (r1) console.log(`Deleted orphan EED course: ${r1.title} (${r1._id})`);

    // Delete orphan GNS course
    const r2 = await Course.findByIdAndDelete(orphanGNS);
    if (r2) console.log(`Deleted orphan GNS course: ${r2.title} (${r2._id})`);

    // Clean up any course access records pointing to deleted course IDs
    await CourseAccess.deleteMany({ course: { $in: [orphanEED, orphanGNS] } });
    console.log("Cleaned up CourseAccess records for deleted courses.");

    // Clean up any quizzes pointing to deleted course IDs
    await Quiz.deleteMany({ course: { $in: [orphanEED, orphanGNS] } });
    console.log("Cleaned up Quiz records for deleted courses.");

    console.log("\n=======================================================");
    console.log("✅ Cleanup Complete! Duplicate course cards removed.");
    console.log("=======================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

cleanupDuplicates();
