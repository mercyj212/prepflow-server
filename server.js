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

// 1. SECURITY HEADERS
app.use(helmet());

// 2. DATA SANITIZATION (Safe implementation for Express 5)
// app.use(mongoSanitize()); // Temporarily disabled for compatibility check

// 3. PARAMETER POLLUTION PROTECTION
// app.use(hpp()); // Temporarily disabled for compatibility check

// 4. RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use('/api/', limiter);

const allowedOrigins = [
  'https://prepupcbt.vercel.app',    // Your Vercel Live App
  'https://prepup-cbt.onrender.com', // Your Render Live App
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`[SECURITY ALERT]: Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS Policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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

app.get('/', (req, res) => {
  res.json({ message: 'Backend is working🚀' });
});

const PORT = process.env.PORT || 5000;

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