import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

const sendEmail = async (options) => {
    // 1. CREATE TRANSPORT (Using environment variables for security)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. TEMPLATE COMPILATION (If provided)
    let htmlContent = options.html;
    if (options.template) {
        try {
            const templatePath = path.join(process.cwd(), 'templates', `${options.template}.hbs`);
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            const compiledTemplate = handlebars.compile(templateSource);
            htmlContent = compiledTemplate(options.context || {});
        } catch (err) {
            console.error('[TEMPLATE ERROR]: Template read failed, falling back to basic layout:', err.message);
        }
    }

    // 3. DEFINE THE PAYLOAD
    const mailOptions = {
        from: `PrepUp CBT <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message || 'New notification from PrepUp CBT',
        html: htmlContent || `<div style="font-family: sans-serif; color: #1a1a1a;">${options.message}</div>`,
    };

    // 4. SECURE DISPATCH
    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL DISPATCHED]: Target -> ${options.email} 🏹`);
    } catch (err) {
        console.error('[DISPATCH ERROR]: Target ->', options.email, err.message);
        throw new Error('Critical communication failure.');
    }
};

export default sendEmail;
