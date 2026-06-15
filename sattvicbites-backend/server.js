import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environment configurations
dotenv.config();

// Initialize DB Connection
connectDB();

const app = express();

// Configure CORS to permit frontend connectivity (Port 5173 and Render URL)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sattvicbites-frontend.onrender.com'
  ],
  credentials: true
}));

// Parse incoming requests payload to JSON
app.use(express.json());

// API Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'SattvicBites Restructured API Server running smoothly on Port 5000' });
});

// Error handling middleware fallback
app.use((err, req, res, next) => {
  console.error(`[Unhandled Error] ${err.stack}`);
  res.status(500).json({
    message: err.message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] SattvicBites API Server listening in ${process.env.NODE_ENV || 'development'} mode on Port ${PORT}`);
});
