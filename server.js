import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// 👇 IMPORT ROUTES
import studentRoutes from './routes/studentRoutes.js';
import accessRoutes from './routes/accessRoutes.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import courseRoutes from './routes/courseRoutes.js';

dotenv.config({ override: true });
console.log('ENV DEBUG: GEMINI KEY is', !!process.env.GEMINI_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// 👇 ROUTES
app.use('/api/students', studentRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/courses', courseRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend is working🚀' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('ENV CHECK:', process.env.MONGODB_URI);
});