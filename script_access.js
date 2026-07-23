import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

import Course from './models/Course.js';
import User from './models/Student.js';
import CourseAccess from './models/CourseAccess.js';
import Department from './models/Department.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find NCC department
  let dept = await Department.findOne({ name: { $regex: /ncc/i } });
  console.log('NCC Dept:', dept ? dept.name : 'Not found');

  // Find AIT 313
  let course = await Course.findOne({ title: { $regex: /AIT 313/i } });
  console.log('Course AIT 313:', course ? course.title : 'Not found');

  if (!course) {
    // try to find by courseCode if exists
    course = await Course.findOne({ courseCode: { $regex: /AIT 313/i } });
    console.log('Course by code AIT 313:', course ? course.title : 'Not found');
  }

  // Find user jaymercy510
  let user3 = await User.findOne({ email: new RegExp('jaymercy510@gmail.com', 'i') });
  if (user3) {
    user3.isAdmin = true;
    await user3.save();
    console.log(`Gave admin access to ${user3.email}`);
  }

  // Give access to emails
  const emails = ['Ebubeonuorahobi@gmail.com', 'franklinpeter2020@gmail.com'];
  for (const email of emails) {
    const user = await User.findOne({ email: new RegExp(email, 'i') });
    if (user) {
      user.isAdmin = true;
      await user.save();
      console.log(`Gave admin access to ${user.email}`);
    } else {
      console.log(`User ${email} not found`);
    }
  }

  // Delete user ikurumanemercy4@gmail.com
  const userDelete = await User.findOneAndDelete({ email: new RegExp('ikurumanemercy4@gmail.com', 'i') });
  if (userDelete) {
    console.log(`Deleted user ${userDelete.email}`);
  }

  process.exit(0);
}

run();
