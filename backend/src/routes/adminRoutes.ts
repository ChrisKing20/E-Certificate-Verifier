import { Router } from 'express';
import { handleGetDashboardStats, handleRetryBlockchainRegister } from '../controllers/adminController';
import {
  handleGetCertificates,
  handleGetCertificateById,
  handleRevokeCertificate,
  handleUpdateBlockchainMetadata,
} from '../controllers/certificateController';
import { handleGetVerificationLogs } from '../controllers/verificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protected Admin Routes
router.use(authMiddleware);

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', handleGetDashboardStats);

// GET /api/admin/certificates
router.get('/certificates', handleGetCertificates);

// GET /api/admin/certificates/:id
router.get('/certificates/:id', handleGetCertificateById);

// PATCH /api/admin/certificates/:id/revoke
router.patch('/certificates/:id/revoke', handleRevokeCertificate);

// PATCH /api/admin/certificates/:id/blockchain
router.patch('/certificates/:id/blockchain', handleUpdateBlockchainMetadata);

// POST /api/admin/certificates/:id/blockchain/register
router.post('/certificates/:id/blockchain/register', handleRetryBlockchainRegister);

// GET /api/admin/verification-logs
router.get('/verification-logs', handleGetVerificationLogs);

export default router;
