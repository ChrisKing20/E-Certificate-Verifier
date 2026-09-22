import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleRegisterUser,
  handleLogin,
  handleGoogleAuth,
  handleGoogleRedirect,
  handleGoogleCallback,
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

// GET /api/auth/google — Initiates Google OAuth redirect flow
router.get('/google', handleGoogleRedirect);

// GET /api/auth/google/callback — Google OAuth callback endpoint
router.get('/google/callback', handleGoogleCallback);

// POST /api/auth/google — Google OAuth verification & auth endpoint (ID token/Payload)
router.post('/google', authLimiter, handleGoogleAuth);

// GET /api/auth/me — Session profile information
router.get('/me', authMiddleware, handleGetMe);

export default router;
