import sendEmail from './utils/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    await sendEmail({
      email: process.env.EMAIL_USER,
      subject: 'Agent OTP Test',
      template: 'verifyEmail',
      context: {
        name: 'Agent Scholar',
        otp: '123456'
      }
    });
    console.log('Successfully dispatched!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to dispatch:', err);
    process.exit(1);
  }
}
test();
