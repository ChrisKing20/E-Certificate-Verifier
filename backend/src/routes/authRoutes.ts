import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleLogin } from '../controllers/authController';

const router = Router();

// Rate limiter for admin login endpoint (15 minutes window, 10 attempts)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Admin Login endpoint (protected by rate limiting)
router.post('/login', loginLimiter, handleLogin);

export default router;
