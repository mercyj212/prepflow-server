import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import connectDB from './config/db.js';

import studentRoutes from './routes/studentRoutes.js';
import accessRoutes from './routes/accessRoutes.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import mongoose from 'mongoose';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { mongoSanitizeMiddleware, hppMiddleware } from './utils/securityMiddleware.js';

// dotenv.config() moved to top

const app = express();
app.use(cookieParser());

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
      return callback(null, true);
    }
    const normalized = origin.replace(/\/$/, '');
    const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalized);
    const isAllowed = allowedOrigins.includes(normalized) || normalized.endsWith('.vercel.app') || isLocalDevOrigin;

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

app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.paystack.co"],
      connectSrc: ["'self'", "https://api.paystack.co", "https://generativelanguage.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ["'self'", "https://checkout.paystack.com", "https://js.paystack.co"],
    },
  },
}));

app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: "Too many authentication attempts. Please try again in an hour." }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

connectDB();

app.get('/api/health', (req, res) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;

  res.status(isDatabaseReady ? 200 : 503).json({
    status: isDatabaseReady ? 'System Functional' : 'System Warming Up',
    database: isDatabaseReady ? 'Operational' : 'Establishing...',
    databaseReadyState: mongoose.connection.readyState
  });
});

app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    message: 'The server is waking up. Please try again in a moment.',
    databaseReadyState: mongoose.connection.readyState
  });
});

app.use('/api/students', studentRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend is working' });
});

const PORT = process.env.PORT || 10000;

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[CRITICAL SERVER ERROR] ${req.method} ${req.url}:`, err.message);
  res.status(statusCode).json({
    message: "A critical backend error occurred.",
    debug: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
