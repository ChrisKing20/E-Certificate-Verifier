"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeCertificate = exports.getCertificateById = exports.getCertificates = exports.retryBlockchainRegistration = exports.createCertificate = void 0;
const Certificate_1 = require("../models/Certificate");
const hashFile_1 = require("../utils/hashFile");
const generateCertificateId_1 = require("../utils/generateCertificateId");
const qrService_1 = require("./qrService");
const blockchainService_1 = require("./blockchainService");
const config_1 = require("../config");
const createCertificate = async (data) => {
    // 1. Calculate SHA-256 hash from actual PDF file buffer
    const fileHash = (0, hashFile_1.calculateSHA256)(data.fileBuffer);
    // Check if hash already exists in MongoDB database
    let existingHash = null;
    try {
        existingHash = await Certificate_1.Certificate.findOne({ fileHash });
    }
    catch (_e) { }
    if (existingHash) {
        throw {
            statusCode: 409,
            message: `Duplicate Certificate PDF detected. A certificate with this exact file hash already exists (ID: ${existingHash.certificateId}).`,
        };
    }
    // 2. Generate unique Certificate ID
    const certificateId = await (0, generateCertificateId_1.generateCertificateId)();
    // 3. Generate QR code
    const { qrDataUrl, qrFilePath } = await (0, qrService_1.generateQRCode)(certificateId);
    // 4. Save to MongoDB via Mongoose
    const certificate = await Certificate_1.Certificate.create({
        certificateId,
        recipientName: data.recipientName.trim(),
        recipientEmail: data.recipientEmail.trim().toLowerCase(),
        eventName: data.eventName.trim(),
        eventDate: data.eventDate.trim(),
        department: data.department ? data.department.trim() : null,
        certificateType: data.certificateType ? data.certificateType.trim() : null,
        filePath: data.filePath,
        fileHash,
        status: 'VALID',
        qrCodePath: qrFilePath || null,
        blockchainStatus: 'PENDING',
        blockchainNetwork: config_1.config.blockchainNetwork,
        blockchainCertificateHash: (0, blockchainService_1.fileHashToBytes32)(fileHash),
    });
    // 5. Register on Ethereum Sepolia Smart Contract
    let blockchainResult;
    try {
        blockchainResult = await (0, blockchainService_1.registerCertificateOnChain)(certificateId, fileHash);
        if (blockchainResult.success) {
            certificate.blockchainStatus = 'CONFIRMED';
            certificate.blockchainTransactionId = blockchainResult.txHash || null;
            certificate.blockchainContractAddress = blockchainResult.contractAddress || null;
            certificate.blockchainRegisteredAt = blockchainResult.registeredAt || new Date();
        }
        else {
            certificate.blockchainStatus = blockchainResult.status === 'NOT_CONNECTED' ? 'NOT_CONNECTED' : 'FAILED';
        }
        await certificate.save();
    }
    catch (err) {
        certificate.blockchainStatus = 'FAILED';
        await certificate.save();
    }
    return {
        certificate,
        qrDataUrl,
        blockchainNotice: certificate.blockchainStatus === 'CONFIRMED'
            ? 'Successfully registered on Ethereum Sepolia Smart Contract!'
            : 'Certificate saved in MongoDB. Blockchain transaction pending or not connected.',
    };
};
exports.createCertificate = createCertificate;
const retryBlockchainRegistration = async (id) => {
    const cert = await Certificate_1.Certificate.findOne({
        $or: [{ _id: id }, { certificateId: id }],
    });
    if (!cert) {
        throw { statusCode: 404, message: 'Certificate record not found.' };
    }
    if (cert.blockchainStatus === 'CONFIRMED') {
        return {
            success: true,
            message: 'Certificate is already confirmed on-chain.',
            certificate: cert,
        };
    }
    const blockchainResult = await (0, blockchainService_1.registerCertificateOnChain)(cert.certificateId, cert.fileHash);
    if (blockchainResult.success) {
        cert.blockchainStatus = 'CONFIRMED';
        cert.blockchainTransactionId = blockchainResult.txHash || null;
        cert.blockchainContractAddress = blockchainResult.contractAddress || null;
        cert.blockchainRegisteredAt = blockchainResult.registeredAt || new Date();
        cert.blockchainCertificateHash = (0, blockchainService_1.fileHashToBytes32)(cert.fileHash);
        await cert.save();
        return {
            success: true,
            message: 'Blockchain registration confirmed!',
            certificate: cert,
        };
    }
    else {
        cert.blockchainStatus = 'FAILED';
        await cert.save();
        throw {
            statusCode: 500,
            message: `Blockchain registration retry failed: ${blockchainResult.error || 'Unknown error'}`,
        };
    }
};
exports.retryBlockchainRegistration = retryBlockchainRegistration;
const getCertificates = async (query) => {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.status && query.status !== 'ALL') {
        if (query.status === 'VALID' || query.status === 'REVOKED') {
            filter.status = query.status;
        }
    }
    if (query.search && query.search.trim()) {
        const searchRegex = new RegExp(query.search.trim(), 'i');
        filter.$or = [
            { certificateId: searchRegex },
            { recipientName: searchRegex },
            { recipientEmail: searchRegex },
            { eventName: searchRegex },
            { fileHash: searchRegex },
        ];
    }
    try {
        const total = await Certificate_1.Certificate.countDocuments(filter);
        const certificates = await Certificate_1.Certificate.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return {
            certificates,
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
            certificates: [],
            pagination: { total: 0, page: 1, limit, totalPages: 0 },
        };
    }
};
exports.getCertificates = getCertificates;
const getCertificateById = async (id) => {
    const certificate = await Certificate_1.Certificate.findOne({
        $or: [{ _id: id }, { certificateId: id }],
    });
    if (!certificate) {
        throw { statusCode: 404, message: 'Certificate record not found.' };
    }
    return certificate;
};
exports.getCertificateById = getCertificateById;
const revokeCertificate = async (id, reason) => {
    const cert = await Certificate_1.Certificate.findOne({
        $or: [{ _id: id }, { certificateId: id }],
    });
    if (!cert) {
        throw { statusCode: 404, message: 'Certificate not found.' };
    }
    if (cert.status === 'REVOKED') {
        throw { statusCode: 400, message: 'Certificate is already revoked.' };
    }
    cert.status = 'REVOKED';
    cert.revokedAt = new Date();
    cert.revocationReason = reason.trim() || 'Certificate revoked by administrative authority.';
    // Attempt blockchain revocation
    try {
        const onChainResult = await (0, blockchainService_1.revokeCertificateOnChain)(cert.certificateId, reason);
        if (onChainResult.success) {
            cert.blockchainRevocationTxId = onChainResult.txHash || null;
            cert.blockchainStatus = 'REVOKED';
        }
        else {
            cert.blockchainStatus = 'REVOCATION_FAILED';
        }
    }
    catch (_e) {
        cert.blockchainStatus = 'REVOCATION_FAILED';
    }
    await cert.save();
    return cert;
};
exports.revokeCertificate = revokeCertificate;
