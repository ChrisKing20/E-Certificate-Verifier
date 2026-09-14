"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Certificate_1 = require("../models/Certificate");
const VerificationLog_1 = require("../models/VerificationLog");
const getDashboardStats = async () => {
    try {
        const [totalCertificates, validCertificates, revokedCertificates, totalVerifications, invalidAttempts,] = await Promise.all([
            Certificate_1.Certificate.countDocuments(),
            Certificate_1.Certificate.countDocuments({ status: 'VALID' }),
            Certificate_1.Certificate.countDocuments({ status: 'REVOKED' }),
            VerificationLog_1.VerificationLog.countDocuments(),
            VerificationLog_1.VerificationLog.countDocuments({
                result: { $in: ['INVALID', 'NOT_FOUND', 'HASH_MISMATCH'] },
            }),
        ]);
        return {
            totalCertificates,
            validCertificates,
            revokedCertificates,
            totalVerifications,
            invalidAttempts,
        };
    }
    catch (err) {
        return {
            totalCertificates: 0,
            validCertificates: 0,
            revokedCertificates: 0,
            totalVerifications: 0,
            invalidAttempts: 0,
        };
    }
};
exports.getDashboardStats = getDashboardStats;
