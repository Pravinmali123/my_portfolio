import express from 'express';
import 'express-async-errors';
import cors from 'cors';

// Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import skillRoutes from './routes/skills.js';
import certificationRoutes from './routes/certifications.js';
import aboutRoutes from './routes/about.js';
import messageRoutes from './routes/messages.js';
import resumeRoutes from './routes/resume.js';
import visitRoutes from './routes/visits.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// CORS setup
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/visits', visitRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;