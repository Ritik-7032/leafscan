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

// Security & CORS
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());

// Body Parser with safe payload limit
app.use(express.json({ limit: '500kb' }));

// Global Rate Limiting: 300 req/min per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: 'Rate limit exceeded. Please try again in a minute.' },
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
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[+] LeafScan Backend running on port ${PORT}`);
    console.log(`    - Health Check: /api/health`);
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
