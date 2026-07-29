import dotenv from 'dotenv';
dotenv.config();

import sendEmail from './utils/emailService.js';

async function test() {
  console.log("Checking Email Provider Config...");
  console.log("BREVO_API_KEY present:", !!process.env.BREVO_API_KEY);
  console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);
  console.log("EMAIL_USER present:", !!process.env.EMAIL_USER);

  const targetEmail = 'mercyjay510@gmail.com';
  console.log(`\nAttempting test send to: ${targetEmail}`);

  try {
    await sendEmail({
      email: targetEmail,
      subject: "🧪 PrepUp Test Email Notification",
      message: "This is a test notification from PrepUp to verify email delivery.",
    });
    console.log("Test email call completed successfully!");
  } catch (err) {
    console.error("Test email FAILED with error:", err.message);
  }
}

test();
