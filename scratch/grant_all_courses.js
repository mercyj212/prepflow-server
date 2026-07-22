import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import CourseAccess from '../models/CourseAccess.js';

dotenv.config();

async function grantAllAccess() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    const targetEmail = "jaymercy510@gmail.com";
    let student = await Student.findOne({ email: targetEmail });

    if (!student) {
      console.log(`Student with email ${targetEmail} not found. Creating student account...`);
      student = await Student.create({
        fullName: "Mercy Jay",
        email: targetEmail,
        password: "Password123@", // Temporary default password if needed
        isVerified: true
      });
      console.log(`Created student account for ${targetEmail}`);
    } else {
      student.isVerified = true;
      await student.save();
      console.log(`Found student ${student.fullName} (${student._id})`);
    }

    const courses = await Course.find({});
    console.log(`Found ${courses.length} total courses in database.`);

    let grantedCount = 0;
    for (const course of courses) {
      const token = `ACCESS_${student._id}_${course._id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      await CourseAccess.findOneAndUpdate(
        { student: student._id, course: course._id },
        {
          $set: {
            accessToken: token,
            isActive: true,
            isUsed: true,
            firstUsedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
      grantedCount++;
    }

    console.log(`\n✅ Success! Granted full active access for all ${grantedCount} courses to ${targetEmail}.`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to grant course access:", err);
    process.exit(1);
  }
}

grantAllAccess();
