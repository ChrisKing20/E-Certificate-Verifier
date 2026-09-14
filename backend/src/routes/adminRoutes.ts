import { Router } from 'express';
import { handleGetDashboardStats, handleRetryBlockchainRegister } from '../controllers/adminController';
import { handleGetCertificates } from '../controllers/certificateController';
import { handleGetVerificationLogs } from '../controllers/verificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protected Admin Routes
router.use(authMiddleware);

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', handleGetDashboardStats);

// GET /api/admin/certificates
router.get('/certificates', handleGetCertificates);

// POST /api/admin/certificates/:id/blockchain/register
router.post('/certificates/:id/blockchain/register', handleRetryBlockchainRegister);

// GET /api/admin/verification-logs
router.get('/verification-logs', handleGetVerificationLogs);

export default router;
