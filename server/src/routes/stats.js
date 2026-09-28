import express from 'express';
import { dbStore } from '../services/dbStore.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/health
 * Public health check for Render/monitoring
 */
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'LeafScan API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/stats
 * Aggregates disease and health counts for the logged-in user
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = await dbStore.getUserStats(req.user.userId);
    res.json(stats);
  } catch (err) {
    console.error('[Stats] Error calculating stats:', err);
    res.status(500).json({ error: 'Failed to calculate user statistics.' });
  }
});

export default router;
