"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const certificateController_1 = require("../controllers/certificateController");
const verificationController_1 = require("../controllers/verificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protected Admin Routes
router.use(authMiddleware_1.authMiddleware);
// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', adminController_1.handleGetDashboardStats);
// GET /api/admin/certificates
router.get('/certificates', certificateController_1.handleGetCertificates);
// POST /api/admin/certificates/:id/blockchain/register
router.post('/certificates/:id/blockchain/register', adminController_1.handleRetryBlockchainRegister);
// GET /api/admin/verification-logs
router.get('/verification-logs', verificationController_1.handleGetVerificationLogs);
exports.default = router;
