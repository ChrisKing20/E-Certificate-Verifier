"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificateController_1 = require("../controllers/certificateController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
// All certificate management routes require Admin JWT authentication
router.use(authMiddleware_1.authMiddleware);
// Issue new certificate with PDF upload (POST /api/certificates)
router.post('/', uploadMiddleware_1.upload.single('file'), certificateController_1.handleCreateCertificate);
// Get list of certificates (GET /api/admin/certificates)
router.get('/', certificateController_1.handleGetCertificates);
// Get certificate by ID (GET /api/admin/certificates/:id)
router.get('/:id', certificateController_1.handleGetCertificateById);
// Revoke certificate (PATCH /api/admin/certificates/:id/revoke)
router.patch('/:id/revoke', certificateController_1.handleRevokeCertificate);
exports.default = router;
