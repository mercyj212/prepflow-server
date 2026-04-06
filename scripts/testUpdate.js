import mongoose from 'mongoose';
import dotenv from 'dotenv';
import sendEmail from '../utils/emailService.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const testUpdate = async () => {
    try {
        console.log('--- PRE-LAUNCH TEST DISPATCH ---');
        const loginUrl = `${process.env.FRONTEND_URL || 'https://prepupcbt.vercel.app'}/login`;
        const testEmail = process.env.EMAIL_USER; // Sending to self (mercyjay510@gmail.com)

        console.log(`Targeting: ${testEmail}`);

        await sendEmail({
            email: testEmail,
            subject: "PREVIEW: New Curriculum Asset Available! 🎓",
            template: 'courseUpdate',
            context: { 
                name: 'Admin Preview',
                courseTitle: 'Introduction to Professional PrepUp Systems',
                loginUrl: loginUrl
            }
        });

        console.log('\n[SUCCESS]: Test email delivered to your inbox! 🎯');
        process.exit(0);
    } catch (err) {
        console.error('[CRITICAL TEST ERROR]:', err);
        process.exit(1);
    }
};

testUpdate();
