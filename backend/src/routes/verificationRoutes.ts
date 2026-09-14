import { Router } from 'express';
import {
  handleVerifyByNumber,
  handleVerifyByPdf,
  handleGetVerificationLogs,
} from '../controllers/verificationController';
import { upload } from '../middleware/uploadMiddleware';
import { verificationRateLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public Verification Endpoints (No login required)
router.get('/number/:certificateId', verificationRateLimiter, handleVerifyByNumber);
router.post('/pdf', verificationRateLimiter, upload.single('file'), handleVerifyByPdf);

// Protected Admin Verification Logs
router.get('/admin/logs', authMiddleware, handleGetVerificationLogs);

export default router;
