import { Router } from 'express';
import {
  handleRegisterInstitution,
  handleGetInstitutions,
  handleApproveInstitution,
  handleRejectInstitution,
  handleSuspendInstitution,
} from '../controllers/institutionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// Public Institution Registration / Onboarding Route
router.post('/register', handleRegisterInstitution);

// Super Admin Protected Routes
router.use(authMiddleware);
router.use(requireRole('SUPER_ADMIN'));

// GET /api/institutions — List all institutions
router.get('/', handleGetInstitutions);

// PATCH /api/institutions/:id/approve — Approve institution onboarding
router.patch('/:id/approve', handleApproveInstitution);

// PATCH /api/institutions/:id/reject — Reject institution onboarding
router.patch('/:id/reject', handleRejectInstitution);

// PATCH /api/institutions/:id/suspend — Suspend institution
router.patch('/:id/suspend', handleSuspendInstitution);

export default router;
