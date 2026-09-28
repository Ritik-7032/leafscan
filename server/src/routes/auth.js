import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { dbStore } from '../services/dbStore.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Strict rate limit for auth endpoints (15 attempts per minute)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Too many authentication attempts. Please wait 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'leafscan_dev_fallback_secret_3029';
  const id = user._id || user.id;
  return jwt.sign(
    { userId: id, email: user.email, name: user.name },
    secret,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    try {
      const existing = await dbStore.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await dbStore.createUser({
        name,
        email,
        passwordHash,
      });

      const token = generateToken(user);

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user,
      });
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      res.status(500).json({ error: 'Server error during registration.' });
    }
  }
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      const user = await dbStore.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      const cleanUser = {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      };

      res.json({
        message: 'Login successful',
        token,
        user: cleanUser,
      });
    } catch (err) {
      console.error('[Auth] Login error:', err);
      res.status(500).json({ error: 'Server error during login.' });
    }
  }
);

/**
 * POST /api/auth/reset-password
 */
router.post(
  '/reset-password',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, newPassword } = req.body;

    try {
      const user = await dbStore.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'No account found with this email address.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      await dbStore.updateUserPassword(email, passwordHash);

      res.json({ message: 'Password has been successfully updated. You can now login.' });
    } catch (err) {
      console.error('[Auth] Reset password error:', err);
      res.status(500).json({ error: 'Failed to reset password.' });
    }
  }
);

/**
 * GET /api/auth/me (Protected)
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await dbStore.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user profile.' });
  }
});

export default router;
