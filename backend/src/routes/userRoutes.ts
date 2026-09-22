import { Router } from 'express';
import { handleGetUserCertificates, handleGetUserProfile } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// GET /api/user/certificates — Get student certificates
router.get('/certificates', handleGetUserCertificates);

// GET /api/user/profile — Get student profile
router.get('/profile', handleGetUserProfile);

export default router;
