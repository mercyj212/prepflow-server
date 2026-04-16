import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 📝 PERSISTENT LOG CAPTURING
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.join(__dirname, 'server_log.txt');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stdout.write = (chunk) => {
  logStream.write(`[${new Date().toLocaleTimeString()}] ${chunk}`);
  return originalStdoutWrite(chunk);
};

process.stderr.write = (chunk) => {
  logStream.write(`[ERROR][${new Date().toLocaleTimeString()}] ${chunk}`);
  return originalStderrWrite(chunk);
};

console.log('--- SERVER RESTARTED - LOGGER ACTIVE ---');

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// 👇 IMPORT ROUTES
import studentRoutes from './routes/studentRoutes.js';
import accessRoutes from './routes/accessRoutes.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import mongoose from 'mongoose';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());

// 👉 MOVE LOGGER TO TOP TO CATCH EVERYTHING
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  next();
});

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://prepupcbt.vercel.app',
  'https://www.prepupcbt.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean).map(origin => origin.replace(/\/$/, ''));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      console.log('[CORS]: No origin provided (likely server-to-server or direct)');
      return callback(null, true);
    }
    const normalized = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.includes(normalized) || normalized.endsWith('.vercel.app');
    
    console.log(`[CORS]: Request from ${origin} - ${isAllowed ? 'ALLOWED' : 'DENIED'}`);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`[CORS][ERROR]: Blocked unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// 1. SECURITY HEADERS 
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
}));

// 2. DATA SANITIZATION 
// app.use(mongoSanitize()); // Incompatible with Express 5 (Cannot set property query of #<IncomingMessage>)

// 3. PARAMETER POLLUTION PROTECTION
// app.use(hpp()); // Incompatible with Express 5
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 2000, // Further increased to avoid polling limits
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 👉 REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

connectDB();

// 👇 ROUTES
app.use('/api/students', studentRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'System Functional', 
    database: mongoose.connection.readyState === 1 ? 'Operational' : 'Establishing...',
    environment: {
      db: process.env.MONGODB_URI ? 'Locked' : 'Missing',
      auth: process.env.JWT_SECRET ? 'Locked' : 'Missing',
      ai: process.env.GEMINI_API_KEY ? 'Locked' : 'Missing'
    }
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend is working🚀' });
});

const PORT = process.env.PORT || 10000; // Render expects 10000 by default

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[CRITICAL SERVER ERROR] ${req.method} ${req.url}:`, err.message);
  console.error(err.stack);
  
  res.status(statusCode).json({ 
    message: "A critical backend error occurred. Please check the server logs.",
    debug: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('ENV CHECK:', process.env.MONGODB_URI);
});