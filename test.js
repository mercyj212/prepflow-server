import nodemailer from 'nodemailer';
const t = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, auth: { user: 'mercyjay510@gmail.com', pass: 'vuwq vuoh zdis zlxr' } });
t.verify().then(() => { console.log('OK'); process.exit(0); }).catch(e => { console.error('FAIL', e); process.exit(1); });
