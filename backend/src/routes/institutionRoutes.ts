import { Router } from 'express';
import {
  handleRegisterInstitution,
  handleGetInstitutions,
  handleGetPendingInstitutions,
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

// GET /api/institutions/pending — List only pending institution onboarding requests
router.get('/pending', handleGetPendingInstitutions);

// APPROVE: Support both POST and PATCH /api/institutions/:id/approve
router.post('/:id/approve', handleApproveInstitution);
router.patch('/:id/approve', handleApproveInstitution);

// REJECT: Support both POST and PATCH /api/institutions/:id/reject
router.post('/:id/reject', handleRejectInstitution);
router.patch('/:id/reject', handleRejectInstitution);

// SUSPEND: Support both POST and PATCH /api/institutions/:id/suspend
router.post('/:id/suspend', handleSuspendInstitution);
router.patch('/:id/suspend', handleSuspendInstitution);

export default router;
