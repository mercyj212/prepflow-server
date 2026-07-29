const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

dotenv.config();

const sendEmailDirect = async (userEmail, userName, courseTitle) => {
  const loginUrl = `${process.env.FRONTEND_URL || "https://prepupcbt.vercel.app"}/login`;
  const subject = `🚀 New Course Available: ${courseTitle}!`;
  
  // Read template
  const templatePath = path.join(__dirname, 'templates', 'courseUpdate.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const compiledTemplate = handlebars.compile(templateSource);
  const htmlContent = compiledTemplate({
    name: userName || "Student",
    courseTitle,
    loginUrl
  });

  const textContent = `Hi ${userName || 'Student'}, fresh curriculum assets for ${courseTitle} are now available on PrepUp!`;

  if (process.env.BREVO_API_KEY) {
    const senderEmail = process.env.EMAIL_USER || 'mercyjay510@gmail.com';
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'PrepUp Team', email: senderEmail },
        to: [{ email: userEmail, name: userName || 'User' }],
        subject,
        htmlContent,
        textContent
      })
    });
    return await response.json();
  }
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('students').find({}).toArray();
  console.log(`Found ${users.length} registered users on database.`);

  const courseTitle = "COMPUTER VISION";
  let count = 0;

  for (const user of users) {
    if (!user.email) continue;
    try {
      console.log(`Sending email to: ${user.email} (${user.fullName || user.nickname || 'User'})...`);
      await sendEmailDirect(user.email, user.fullName || user.nickname, courseTitle);
      count++;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`Failed to send email to ${user.email}:`, e.message);
    }
  }

  console.log(`Successfully broadcasted new course notification to ${count} users!`);
  process.exit(0);
}).catch(console.error);
