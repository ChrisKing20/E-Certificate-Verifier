"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
/**
 * Generates a QR Code for certificate verification URL
 * Example URL: http://localhost:5173/verify?certificate=ECV-2026-001245
 */
const generateQRCode = async (certificateId) => {
    const verificationUrl = `${config_1.config.corsOrigin}/verify?certificate=${encodeURIComponent(certificateId)}`;
    const qrDataUrl = await qrcode_1.default.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
            dark: '#0B132B',
            light: '#FFFFFF',
        },
    });
    if (!fs_1.default.existsSync(config_1.config.uploadDir)) {
        fs_1.default.mkdirSync(config_1.config.uploadDir, { recursive: true });
    }
    const qrFileName = `qr_${certificateId.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const qrFilePath = path_1.default.join(config_1.config.uploadDir, qrFileName);
    try {
        await qrcode_1.default.toFile(qrFilePath, verificationUrl);
    }
    catch (_e) { }
    return {
        qrDataUrl,
        qrFilePath: `uploads/${qrFileName}`,
    };
};
exports.generateQRCode = generateQRCode;
