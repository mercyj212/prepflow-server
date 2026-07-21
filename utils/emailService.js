import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (options) => {
    // 1. COMPILE TEMPLATE (If provided)
    let htmlContent = options.html;
    let textContent = options.message;
    
    if (options.template) {
        try {
            // Bulletproof path resolution for cloud nodes
            const templatePath = path.join(__dirname, '..', 'templates', `${options.template}.hbs`);
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            const compiledTemplate = handlebars.compile(templateSource);
            htmlContent = compiledTemplate(options.context || {});
        } catch (err) {
            console.error('[TEMPLATE ERROR]: Template read failed, falling back to basic layout:', err.message);
        }
    }

    if (!textContent) {
        textContent = options.context?.otp 
            ? `Hi ${options.context?.name || 'there'}, your verification code is: ${options.context?.otp}. Welcome to PrepUp!` 
            : `Hi ${options.context?.name || 'there'}, welcome to PrepUp!`;
    }

    // 2. DISPATCH VIA RESEND HTTP API IF KEY IS DEFINED (Render/Vercel Safe)
    if (process.env.RESEND_API_KEY) {
        console.log(`[RESEND INITIATED]: Dispatching to ${options.email} via HTTPS API`);
        const sender = process.env.EMAIL_FROM || 'PrepUp <onboarding@resend.dev>';
        
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: sender,
                    to: [options.email],
                    replyTo: options.replyTo,
                    subject: options.subject,
                    html: htmlContent || `<div style="font-family: sans-serif; color: #1a1a1a;">${textContent}</div>`,
                    text: textContent
                })
            });

            const resData = await response.json();
            if (!response.ok) {
                throw new Error(resData.message || JSON.stringify(resData));
            }
            console.log(`[EMAIL DISPATCHED VIA RESEND]: Target -> ${options.email}, ID -> ${resData.id}`);
            return;
        } catch (err) {
            console.error('[RESEND DISPATCH ERROR]: Target ->', options.email, err.message);
            throw new Error(`Resend API Error: ${err.message}`);
        }
    }

    // 3. SMTP FALLBACK DISPATCH (For local development/SMTP configuration)
    console.log(`[SMTP FALLBACK INITIATED]: Dispatching to ${options.email} via SMTP`);
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '465');
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        host,
        port,
        secure,
        family: 4,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            servername: host,
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        }
    });

    const mailOptions = {
        from: `"PrepUp Team" <${process.env.EMAIL_USER}>`,
        to: options.email,
        replyTo: options.replyTo,
        subject: options.subject,
        text: textContent,
        html: htmlContent || `<div style="font-family: sans-serif; color: #1a1a1a;">${textContent}</div>`,
        headers: {
            'X-Entity-Ref-ID': Date.now().toString(),
            'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`
        }
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL DISPATCHED VIA SMTP]: Target -> ${options.email}`);
    } catch (err) {
        console.error('[SMTP DISPATCH ERROR]: Target ->', options.email, err.message);
        throw new Error(err.message);
    }
};

export default sendEmail;
