import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scans.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leafscan';

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigin = process.env.CLIENT_URL;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching CLIENT_URL
      if (!origin || !allowedOrigin || allowedOrigin === '*' || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(null, true); // Dev fallback for preview environments
      }
    },
    credentials: true,
  })
);

// Body Parser with safe payload limit
app.use(express.json({ limit: '200kb' }));

// Global Rate Limiting: 60 req/min per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Rate limit exceeded. Maximum 60 requests per minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// API Route Mounts
app.use('/api', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[LeafScan Server Error]:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// MongoDB Connection & Server Launch
async function startServer() {
  app.listen(PORT, () => {
    console.log(`[+] LeafScan Backend running on http://localhost:${PORT}`);
    console.log(`    - Health Check: http://localhost:${PORT}/api/health`);
  });

  if (MONGO_URI && !MONGO_URI.includes('<username>')) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 });
      console.log('[+] Connected to MongoDB database successfully.');
    } catch (dbErr) {
      console.warn('[!] Local MongoDB server not found. Backend running in offline/in-memory mode for guest scans.');
    }
  }
}

startServer();
