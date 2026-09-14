"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificationController_1 = require("../controllers/verificationController");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public Verification Endpoints (No login required)
router.get('/number/:certificateId', rateLimiter_1.verificationRateLimiter, verificationController_1.handleVerifyByNumber);
router.post('/pdf', rateLimiter_1.verificationRateLimiter, uploadMiddleware_1.upload.single('file'), verificationController_1.handleVerifyByPdf);
// Protected Admin Verification Logs
router.get('/admin/logs', authMiddleware_1.authMiddleware, verificationController_1.handleGetVerificationLogs);
exports.default = router;
