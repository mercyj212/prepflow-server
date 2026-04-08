import 'dotenv/config';
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

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

const app = express();

// 👇 DEBUGGING: GLOBAL REQUEST LOGGER (Put this at the very top)
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

const corsOptions = {
  origin: true, // ⚠️ REFLECTIVE ORIGIN: Accepts any origin and reflects it back
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
  max: 100, 
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
app.use('/api/chat', chatRoutes);

import mongoose from 'mongoose';

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
  console.error(`[SERVER ERROR] ${req.method} ${req.url}:`, err.stack);
  
  res.status(statusCode).json({ 
    message: err.message, 
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    error: err.name
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('ENV CHECK:', process.env.MONGODB_URI);
});