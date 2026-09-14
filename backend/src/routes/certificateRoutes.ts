import { Router } from 'express';
import {
  handleCreateCertificate,
  handleGetCertificates,
  handleGetCertificateById,
  handleRevokeCertificate,
  handleUpdateBlockchainMetadata,
} from '../controllers/certificateController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// All certificate management routes require Admin JWT authentication
router.use(authMiddleware);

// Issue new certificate with PDF upload (POST /api/certificates)
router.post('/', upload.single('file'), handleCreateCertificate);

// Get list of certificates (GET /api/admin/certificates)
router.get('/', handleGetCertificates);

// Get certificate by ID (GET /api/admin/certificates/:id)
router.get('/:id', handleGetCertificateById);

// Revoke certificate (PATCH /api/admin/certificates/:id/revoke)
router.patch('/:id/revoke', handleRevokeCertificate);

// Update blockchain metadata (PATCH /api/admin/certificates/:id/blockchain)
router.patch('/:id/blockchain', handleUpdateBlockchainMetadata);

export default router;
