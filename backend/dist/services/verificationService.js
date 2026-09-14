"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerificationLogs = exports.verifyByPdfHash = exports.verifyByCertificateNumber = void 0;
const Certificate_1 = require("../models/Certificate");
const VerificationLog_1 = require("../models/VerificationLog");
const hashFile_1 = require("../utils/hashFile");
const formatVerifiedAt = (date) => {
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
const verifyByCertificateNumber = async (certNumber, ipAddress = '127.0.0.1', userAgent = 'Unknown') => {
    const startTime = Date.now();
    const normalizedNumber = certNumber.trim().toUpperCase();
    const now = new Date();
    const verifiedAtStr = formatVerifiedAt(now);
    if (!normalizedNumber) {
        return {
            success: false,
            status: 'INVALID',
            message: 'Please provide a valid certificate number.',
            reason: 'Empty certificate number submitted.',
            verifiedAt: verifiedAtStr,
        };
    }
    let certificate = null;
    try {
        certificate = await Certificate_1.Certificate.findOne({ certificateId: normalizedNumber });
    }
    catch (err) {
        console.log('MongoDB query notice: database connection offline or starting.');
    }
    if (!certificate) {
        try {
            await VerificationLog_1.VerificationLog.create({
                certificateId: normalizedNumber,
                verificationMethod: 'CERTIFICATE_NUMBER',
                result: 'NOT_FOUND',
                ipAddress,
                userAgent,
                responseTimeMs: Date.now() - startTime,
            });
        }
        catch (_e) { }
        return {
            success: false,
            status: 'NOT_FOUND',
            message: 'Certificate not found in institutional registry.',
            reason: 'The specified certificate number does not match any registered record in MongoDB.',
            verifiedAt: verifiedAtStr,
        };
    }
    const isRevoked = certificate.status === 'REVOKED';
    const resultEnum = isRevoked ? 'REVOKED' : 'VALID';
    try {
        await VerificationLog_1.VerificationLog.create({
            certificateId: certificate.certificateId,
            verificationMethod: 'CERTIFICATE_NUMBER',
            result: resultEnum,
            ipAddress,
            userAgent,
            responseTimeMs: Date.now() - startTime,
        });
    }
    catch (_e) { }
    if (isRevoked) {
        return {
            success: true,
            status: 'REVOKED',
            message: 'Certificate found but has been REVOKED.',
            reason: certificate.revocationReason || 'This certificate was revoked by the issuing authority.',
            certificate: {
                certificateId: certificate.certificateId,
                recipientName: certificate.recipientName,
                recipientEmail: certificate.recipientEmail,
                eventName: certificate.eventName,
                eventDate: certificate.eventDate,
                department: certificate.department,
                certificateType: certificate.certificateType,
                fileHash: certificate.fileHash,
                issuedAt: certificate.issuedAt.toISOString(),
                status: certificate.status,
                revokedAt: certificate.revokedAt ? certificate.revokedAt.toISOString() : null,
                revocationReason: certificate.revocationReason,
                qrCodePath: certificate.qrCodePath,
                blockchainNetwork: certificate.blockchainNetwork,
                blockchainContractAddress: certificate.blockchainContractAddress,
                blockchainTransactionId: certificate.blockchainTransactionId,
                blockchainCertificateHash: certificate.blockchainCertificateHash,
                blockchainStatus: certificate.blockchainStatus,
            },
            verifiedAt: verifiedAtStr,
        };
    }
    return {
        success: true,
        status: 'VALID',
        message: 'Certificate authenticity confirmed.',
        certificate: {
            certificateId: certificate.certificateId,
            recipientName: certificate.recipientName,
            recipientEmail: certificate.recipientEmail,
            eventName: certificate.eventName,
            eventDate: certificate.eventDate,
            department: certificate.department,
            certificateType: certificate.certificateType,
            fileHash: certificate.fileHash,
            issuedAt: certificate.issuedAt.toISOString(),
            status: certificate.status,
            qrCodePath: certificate.qrCodePath,
            blockchainStatus: certificate.blockchainStatus,
        },
        verifiedAt: verifiedAtStr,
    };
};
exports.verifyByCertificateNumber = verifyByCertificateNumber;
const verifyByPdfHash = async (fileBuffer, ipAddress = '127.0.0.1', userAgent = 'Unknown') => {
    const startTime = Date.now();
    const now = new Date();
    const verifiedAtStr = formatVerifiedAt(now);
    const calculatedHash = (0, hashFile_1.calculateSHA256)(fileBuffer);
    let certificate = null;
    try {
        certificate = await Certificate_1.Certificate.findOne({ fileHash: calculatedHash });
    }
    catch (err) {
        console.log('MongoDB query notice: database connection offline or starting.');
    }
    if (!certificate) {
        try {
            await VerificationLog_1.VerificationLog.create({
                certificateId: null,
                verificationMethod: 'PDF',
                result: 'HASH_MISMATCH',
                ipAddress,
                userAgent,
                responseTimeMs: Date.now() - startTime,
            });
        }
        catch (_e) { }
        return {
            success: false,
            status: 'HASH_MISMATCH',
            message: 'PDF Verification Failed.',
            reason: `Calculated document hash (${calculatedHash.slice(0, 16)}...) does not match any registered certificate in our MongoDB database. The document may be modified or forged.`,
            verifiedAt: verifiedAtStr,
        };
    }
    let previousVerificationsCount = 0;
    try {
        previousVerificationsCount = await VerificationLog_1.VerificationLog.countDocuments({
            certificateId: certificate.certificateId,
            verificationMethod: 'PDF',
        });
    }
    catch (_e) { }
    const isRevoked = certificate.status === 'REVOKED';
    const resultEnum = isRevoked ? 'REVOKED' : 'VALID';
    try {
        await VerificationLog_1.VerificationLog.create({
            certificateId: certificate.certificateId,
            verificationMethod: 'PDF',
            result: resultEnum,
            ipAddress,
            userAgent,
            responseTimeMs: Date.now() - startTime,
        });
    }
    catch (_e) { }
    if (isRevoked) {
        return {
            success: true,
            status: 'REVOKED',
            message: 'PDF matches registered record, but certificate has been REVOKED.',
            reason: certificate.revocationReason || 'This certificate was revoked by the issuing authority.',
            certificate: {
                certificateId: certificate.certificateId,
                recipientName: certificate.recipientName,
                recipientEmail: certificate.recipientEmail,
                eventName: certificate.eventName,
                eventDate: certificate.eventDate,
                department: certificate.department,
                certificateType: certificate.certificateType,
                fileHash: certificate.fileHash,
                issuedAt: certificate.issuedAt.toISOString(),
                status: certificate.status,
                revokedAt: certificate.revokedAt ? certificate.revokedAt.toISOString() : null,
                revocationReason: certificate.revocationReason,
                qrCodePath: certificate.qrCodePath,
                blockchainNetwork: certificate.blockchainNetwork,
                blockchainContractAddress: certificate.blockchainContractAddress,
                blockchainTransactionId: certificate.blockchainTransactionId,
                blockchainCertificateHash: certificate.blockchainCertificateHash,
                blockchainStatus: certificate.blockchainStatus,
            },
            verifiedAt: verifiedAtStr,
        };
    }
    return {
        success: true,
        status: 'VALID',
        message: 'Authentic PDF Certificate Verified.',
        duplicateNotice: previousVerificationsCount > 0,
        certificate: {
            certificateId: certificate.certificateId,
            recipientName: certificate.recipientName,
            recipientEmail: certificate.recipientEmail,
            eventName: certificate.eventName,
            eventDate: certificate.eventDate,
            department: certificate.department,
            certificateType: certificate.certificateType,
            fileHash: certificate.fileHash,
            issuedAt: certificate.issuedAt.toISOString(),
            status: certificate.status,
            qrCodePath: certificate.qrCodePath,
            blockchainStatus: certificate.blockchainStatus,
        },
        verifiedAt: verifiedAtStr,
    };
};
exports.verifyByPdfHash = verifyByPdfHash;
const getVerificationLogs = async (query) => {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;
    try {
        const total = await VerificationLog_1.VerificationLog.countDocuments();
        const logs = await VerificationLog_1.VerificationLog.find()
            .sort({ verifiedAt: -1 })
            .skip(skip)
            .limit(limit);
        return {
            logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (err) {
        return {
            logs: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
        };
    }
};
exports.getVerificationLogs = getVerificationLogs;
