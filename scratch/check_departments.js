import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

async function checkDepts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const depts = await Department.find({}).populate('faculty');
    console.log(`Found ${depts.length} departments in MongoDB:`);
    depts.forEach(d => console.log(` - ID: ${d._id} | Name: "${d.name}" | Faculty: ${d.faculty?.name}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDepts();
