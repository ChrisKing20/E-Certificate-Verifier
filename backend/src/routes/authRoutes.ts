import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleRegisterUser,
  handleLogin,
  handleGoogleAuth,
  handleGetMe,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rate limiter for login/signup endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register — Student/User registration
router.post('/register', authLimiter, handleRegisterUser);

// POST /api/auth/login — Unified login endpoint
router.post('/login', authLimiter, handleLogin);

// POST /api/auth/google — Google OAuth verification & auth endpoint
router.post('/google', authLimiter, handleGoogleAuth);

// GET /api/auth/me — Session profile information
router.get('/me', authMiddleware, handleGetMe);

export default router;
