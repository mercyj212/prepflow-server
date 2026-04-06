import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (options) => {
    // ENFORCE IPv4 (Fixes Render ENETUNREACH on IPv6)
    const hostName = process.env.EMAIL_HOST || 'smtp.gmail.com';
    let targetHost = hostName;
    try {
        const ipv4Addresses = await dns.promises.resolve4(hostName);
        if (ipv4Addresses && ipv4Addresses.length > 0) {
            targetHost = ipv4Addresses[0]; 
        }
    } catch (dnsErr) {
        console.warn('[IPv4 DNS Fallback Failed]:', dnsErr.message);
    }

    // 1. CREATE TRANSPORT (Using environment variables for security)
    const transporter = nodemailer.createTransport({
        host: targetHost,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: parseInt(process.env.EMAIL_PORT) === 465, // True for 465, false for 587
        connectionTimeout: 20000, 
        greetingTimeout: 20000, 
        socketTimeout: 20000, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            servername: hostName, // Match original hostname for Google's SSL Certificate
            rejectUnauthorized: true, // Maintain Strict Security
        }
    });

    // 2. TEMPLATE COMPILATION (If provided)
    let htmlContent = options.html;
    if (options.template) {
        try {
            // Bulletproof path resolution for Render containers
            const templatePath = path.join(__dirname, '..', 'templates', `${options.template}.hbs`);
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
        console.log(`[EMAIL DISPATCHED]: Target -> ${options.email}`);
    } catch (err) {
        console.error('[DISPATCH ERROR]: Target ->', options.email, err.message);
        throw new Error(err.message);
    }
};

export default sendEmail;
