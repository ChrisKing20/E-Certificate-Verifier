"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRevokeCertificate = exports.handleGetCertificateById = exports.handleGetCertificates = exports.handleCreateCertificate = void 0;
const certificateService_1 = require("../services/certificateService");
const fs_1 = __importDefault(require("fs"));
const handleCreateCertificate = async (req, res, next) => {
    try {
        const { recipientName, recipientEmail, eventName, eventDate, department, certificateType } = req.body;
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Certificate PDF document file is required.',
            });
            return;
        }
        if (!recipientName || !recipientEmail || !eventName || !eventDate) {
            if (req.file.path && fs_1.default.existsSync(req.file.path)) {
                fs_1.default.unlinkSync(req.file.path);
            }
            res.status(400).json({
                success: false,
                message: 'Required fields missing: recipientName, recipientEmail, eventName, and eventDate are required.',
            });
            return;
        }
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        const relativePath = `uploads/${req.file.filename}`;
        const result = await (0, certificateService_1.createCertificate)({
            recipientName,
            recipientEmail,
            eventName,
            eventDate,
            department,
            certificateType,
            fileBuffer,
            filePath: relativePath,
        });
        res.status(201).json({
            success: true,
            message: 'Certificate issued successfully.',
            certificate: result.certificate,
            qrDataUrl: result.qrDataUrl,
        });
    }
    catch (error) {
        if (req.file?.path && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        next(error);
    }
};
exports.handleCreateCertificate = handleCreateCertificate;
const handleGetCertificates = async (req, res, next) => {
    try {
        const { search, status, page, limit } = req.query;
        const result = await (0, certificateService_1.getCertificates)({
            search: search,
            status: status,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
        res.status(200).json({
            success: true,
            data: result.certificates,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.handleGetCertificates = handleGetCertificates;
const handleGetCertificateById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const certificate = await (0, certificateService_1.getCertificateById)(id);
        res.status(200).json({
            success: true,
            certificate,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.handleGetCertificateById = handleGetCertificateById;
const handleRevokeCertificate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { reason } = req.body;
        if (!reason || !reason.trim()) {
            res.status(400).json({
                success: false,
                message: 'Revocation reason is required.',
            });
            return;
        }
        const certificate = await (0, certificateService_1.revokeCertificate)(id, reason);
        res.status(200).json({
            success: true,
            message: 'Certificate revoked successfully.',
            certificate,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.handleRevokeCertificate = handleRevokeCertificate;
