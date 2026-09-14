"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificateId = void 0;
const Certificate_1 = require("../models/Certificate");
/**
 * Generates a unique Certificate ID in format: ECV-YYYY-XXXXXX
 * Example: ECV-2026-001245
 */
const generateCertificateId = async () => {
    const year = new Date().getFullYear();
    let unique = false;
    let certificateId = '';
    let attempts = 0;
    while (!unique && attempts < 10) {
        attempts++;
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
        certificateId = `ECV-${year}-${randomDigits}`;
        try {
            const existing = await Certificate_1.Certificate.findOne({ certificateId });
            if (!existing) {
                unique = true;
            }
        }
        catch (err) {
            unique = true;
        }
    }
    return certificateId || `ECV-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
};
exports.generateCertificateId = generateCertificateId;
