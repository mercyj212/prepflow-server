import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const t = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

t.verify()
  .then(() => { console.log('✅ SMTP Connection OK'); process.exit(0); })
  .catch(e => { console.error('❌ SMTP FAIL', e.message); process.exit(1); });
