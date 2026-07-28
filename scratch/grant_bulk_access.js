import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import CourseAccess from '../models/CourseAccess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const emails = [
  "danieleneluwe@gmail.com",
  "Perryxau@gmail.com",
  "Selenawilliams2034@gmail.com"
];

async function grantAllAccess() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    const allCourses = await Course.find({});
    console.log(`Found ${allCourses.length} total courses in DB.`);

    for (const email of emails) {
      console.log(`\nProcessing email: ${email}`);
      const student = await Student.findOne({ email: new RegExp('^' + email + '$', 'i') });

      if (!student) {
        console.log(`Student with email ${email} not found. Skipping... (They need to create an account first)`);
        continue;
      }

      console.log(`Found student ${student.fullName} (${student._id})`);
      student.isVerified = true;
      await student.save();

      let newAccessCount = 0;
      for (const course of allCourses) {
        const existingAccess = await CourseAccess.findOne({
          student: student._id,
          course: course._id
        });

        if (!existingAccess) {
          await CourseAccess.create({
            student: student._id,
            course: course._id,
            accessToken: crypto.randomBytes(16).toString('hex'),
            isActive: true,
            isUsed: true,
            firstUsedAt: new Date()
          });
          newAccessCount++;
        } else if (!existingAccess.isActive) {
          existingAccess.isActive = true;
          await existingAccess.save();
          newAccessCount++;
        }
      }
      
      console.log(`Granted access to ${newAccessCount} new/inactive courses for ${email}`);
    }

    console.log("\nFinished processing all emails.");
    process.exit(0);
  } catch (err) {
    console.error("Error granting access:", err);
    process.exit(1);
  }
}

grantAllAccess();
