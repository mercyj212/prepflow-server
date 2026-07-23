import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

async function fixGNS302Departments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Canonical School of ICT Faculty
    const canonicalFaculty = await Faculty.findOne({ name: /School of ICT/i });
    if (!canonicalFaculty) {
      throw new Error("Canonical 'School of ICT' faculty not found!");
    }
    console.log(`Canonical Faculty: ${canonicalFaculty.name} (${canonicalFaculty._id})`);

    // Target department mapping (Name -> Canonical Dept ID)
    const targetDeptNames = [
      "Software and Web Development",
      "Artificial Intelligence",
      "Networking and Cloud Computing",
      "Cyber Security"
    ];

    for (const name of targetDeptNames) {
      const canonicalDept = await Department.findOne({
        faculty: canonicalFaculty._id,
        name: new RegExp(name, 'i')
      });

      if (!canonicalDept) {
        console.error(`Could not find canonical department for ${name}`);
        continue;
      }

      console.log(`Canonical Dept for "${name}": ${canonicalDept._id}`);

      // Find GNS 302 course for this department title
      const gnsCourse = await Course.findOne({
        title: new RegExp(`COMMUNICATION SKILLS & LOGIC - ${name}`, 'i')
      });

      if (gnsCourse) {
        gnsCourse.department = canonicalDept._id;
        gnsCourse.faculty = canonicalFaculty._id;
        await gnsCourse.save();
        console.log(`✅ Re-linked GNS 302 course "${gnsCourse.title}" -> Dept ID: ${canonicalDept._id}`);
      }
    }

    // Delete orphan duplicate 'ICT' faculty and its departments
    const duplicateFaculty = await Faculty.findOne({ name: "ICT" });
    if (duplicateFaculty) {
      await Department.deleteMany({ faculty: duplicateFaculty._id });
      await Faculty.findByIdAndDelete(duplicateFaculty._id);
      console.log("✅ Removed duplicate 'ICT' faculty and its duplicate departments.");
    }

    console.log("\n=======================================================");
    console.log("✅ GNS 302 Department Re-linking Complete!");
    console.log("=======================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

fixGNS302Departments();
