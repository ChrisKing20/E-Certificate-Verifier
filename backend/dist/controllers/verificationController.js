"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetVerificationLogs = exports.handleVerifyByPdf = exports.handleVerifyByNumber = void 0;
const verificationService_1 = require("../services/verificationService");
const fs_1 = __importDefault(require("fs"));
const handleVerifyByNumber = async (req, res, next) => {
    try {
        const certificateId = req.params.certificateId;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const result = await (0, verificationService_1.verifyByCertificateNumber)(certificateId, ipAddress, userAgent);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.handleVerifyByNumber = handleVerifyByNumber;
const handleVerifyByPdf = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                status: 'INVALID',
                message: 'PDF document file is required for verification.',
            });
            return;
        }
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        if (fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        const result = await (0, verificationService_1.verifyByPdfHash)(fileBuffer, ipAddress, userAgent);
        res.status(200).json(result);
    }
    catch (error) {
        if (req.file?.path && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        next(error);
    }
};
exports.handleVerifyByPdf = handleVerifyByPdf;
const handleGetVerificationLogs = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await (0, verificationService_1.getVerificationLogs)({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({
            success: true,
            logs: result.logs,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.handleGetVerificationLogs = handleGetVerificationLogs;
