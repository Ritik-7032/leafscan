import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbStore } from '../services/dbStore.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all scan endpoints
router.use(requireAuth);

/**
 * POST /api/scans
 * Saves a new diagnosis scan result
 */
router.post(
  '/',
  [
    body('vegetable').trim().notEmpty().withMessage('Vegetable is required'),
    body('disease').trim().notEmpty().withMessage('Disease is required'),
    body('confidence').isNumeric().withMessage('Confidence must be a number'),
    body('isHealthy').isBoolean().withMessage('isHealthy must be boolean'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { vegetable, disease, confidence, isHealthy, thumbnail } = req.body;

    try {
      const scan = await dbStore.saveScan({
        userId: req.user.userId,
        vegetable,
        disease,
        confidence,
        isHealthy,
        thumbnail: thumbnail ? String(thumbnail).slice(0, 40000) : undefined,
      });

      res.status(201).json({ message: 'Scan saved successfully', scan });
    } catch (err) {
      console.error('[Scans] Save error:', err);
      res.status(500).json({ error: 'Failed to save scan record.' });
    }
  }
);

/**
 * GET /api/scans
 * Returns latest 50 scans for the logged-in user, newest first
 */
router.get('/', async (req, res) => {
  try {
    const scans = await dbStore.getUserScans(req.user.userId, 50);
    res.json({ scans });
  } catch (err) {
    console.error('[Scans] Fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve scan history.' });
  }
});

/**
 * DELETE /api/scans/:id
 * Deletes a specific scan (only if owned by the requesting user)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dbStore.deleteUserScan(id, req.user.userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Scan not found or unauthorized.' });
    }

    res.json({ message: 'Scan removed successfully.' });
  } catch (err) {
    console.error('[Scans] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete scan record.' });
  }
});

export default router;
