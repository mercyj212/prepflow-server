import 'dotenv/config';
console.log('URI:', process.env.MONGODB_URI);
console.log('KEYS:', Object.keys(process.env).filter(k => k.includes('MONGODB') || k.includes('JWT')));
