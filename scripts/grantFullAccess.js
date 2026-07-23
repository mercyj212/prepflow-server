import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

import Student from '../models/Student.js';
import Course from '../models/Course.js';
import CourseAccess from '../models/CourseAccess.js';
import Transaction from '../models/Transaction.js';

const targetEmail = 'ebubeonuorahobi@gmail.com';

const grantAccess = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI is missing from process.env');
      process.exit(1);
    }

    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected.`);

    // 1. Find or create Student
    let student = await Student.findOne({ email: targetEmail.toLowerCase() });
    
    if (!student) {
      console.log(`Student ${targetEmail} not found. Creating account...`);
      student = await Student.create({
        fullName: 'Ebube Onuorah Obi',
        email: targetEmail.toLowerCase(),
        isVerified: true,
        accessStatus: 'active',
        role: 'student'
      });
      console.log(`✅ Created student account for ${targetEmail}`);
    } else {
      student.isVerified = true;
      student.accessStatus = 'active';
      await student.save();
      console.log(`✅ Verified and activated existing student account for ${targetEmail} (ID: ${student._id})`);
    }

    // 2. Fetch all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses in the database.`);

    if (courses.length === 0) {
      console.log(`⚠️ No active courses found to unlock.`);
      process.exit(0);
    }

    // 3. Grant access to all courses & record audit transactions
    let unlockedCount = 0;
    for (const course of courses) {
      const accessToken = `ADM-GRANT-${crypto.randomBytes(8).toString('hex')}`;
      
      await CourseAccess.findOneAndUpdate(
        { student: student._id, course: course._id },
        {
          student: student._id,
          course: course._id,
          accessToken,
          isActive: true,
          isUsed: true,
          firstUsedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Record complimentary transaction record for student history
      const ref = `FREE-ADM-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      await Transaction.findOneAndUpdate(
        { student: student._id, course: course._id, status: 'success' },
        {
          student: student._id,
          course: course._id,
          reference: ref,
          amount: 0,
          status: 'success',
          paidAt: new Date()
        },
        { upsert: true, new: true }
      );

      unlockedCount++;
      console.log(`   [UNLOCKED]: ${course.title} (${course.level || 'All Level'})`);
    }

    console.log(`\n🎉 SUCCESS! Full access granted for ${targetEmail} across ${unlockedCount} courses.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error granting full access:', error);
    process.exit(1);
  }
};

grantAccess();
