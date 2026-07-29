import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

async function testProviders() {
  const targetEmail = 'mercyjay510@gmail.com';
  console.log("Testing email providers for:", targetEmail);

  // 1. Test Resend
  if (process.env.RESEND_API_KEY) {
    console.log("\n--- Testing Resend API ---");
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'PrepUp <onboarding@resend.dev>',
          to: [targetEmail],
          subject: '🧪 Resend Test Email',
          html: '<h1>Testing Resend Delivery</h1>'
        })
      });
      const resData = await response.json();
      console.log("Resend Status:", response.status, resData);
    } catch (e) {
      console.error("Resend Error:", e.message);
    }
  }

  // 2. Test SMTP
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("\n--- Testing SMTP (Gmail) ---");
    try {
      const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.EMAIL_PORT || '465');
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
      });

      const info = await transporter.sendMail({
        from: `"PrepUp Team" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: '🧪 SMTP Test Email',
        html: '<h1>Testing SMTP Delivery</h1>'
      });
      console.log("SMTP Sent successfully:", info.messageId);
    } catch (e) {
      console.error("SMTP Error:", e.message);
    }
  }
}

testProviders();
