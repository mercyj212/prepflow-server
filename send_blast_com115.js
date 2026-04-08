import 'dotenv/config';
import mongoose from 'mongoose';
import Student from './models/Student.js';
import sendEmail from './utils/emailService.js';

const run = async () => {
    try {
        console.log("--- STARTING DESIGNED BLAST ---");
        await mongoose.connect(process.env.MONGODB_URI);
        const students = await Student.find({ role: 'student' });
        console.log(`Scholars found: ${students.length}`);

        const subject = "Strategy Update: COM115 Assessment Package is Live";
        const loginUrl = `${process.env.FRONTEND_URL}/login`;
        const helpUrl = `${process.env.FRONTEND_URL}/help-center`;

        for (const student of students) {
            try {
                await sendEmail({
                    email: student.email,
                    subject,
                    template: 'blastNotify',
                    context: {
                        name: student.fullName,
                        packageName: "Application Package COM115",
                        loginUrl,
                        helpUrl
                    }
                });
                console.log(`SUCCESS: ${student.email}`);
            } catch (err) {
                console.log(`FAILED: ${student.email} - ${err.message}`);
            }
        }

        console.log("--- DESIGNED BLAST COMPLETE ---");
        process.exit(0);
    } catch (err) {
        console.error("CRITICAL ERROR:", err.message);
        process.exit(1);
    }
};

run();
