"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certificate = void 0;
const mongoose_1 = require("mongoose");
const certificateSchema = new mongoose_1.Schema({
    certificateId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    recipientName: {
        type: String,
        required: true,
        trim: true,
    },
    recipientEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    eventName: {
        type: String,
        required: true,
        trim: true,
    },
    eventDate: {
        type: String,
        required: true,
        trim: true,
    },
    department: {
        type: String,
        default: null,
        trim: true,
    },
    certificateType: {
        type: String,
        default: null,
        trim: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    fileHash: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['VALID', 'REVOKED'],
        default: 'VALID',
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
    revocationReason: {
        type: String,
        default: null,
    },
    qrCodePath: {
        type: String,
        default: null,
    },
    blockchainNetwork: {
        type: String,
        default: 'Ethereum Sepolia',
    },
    blockchainContractAddress: {
        type: String,
        default: null,
    },
    blockchainTransactionId: {
        type: String,
        default: null,
    },
    blockchainCertificateHash: {
        type: String,
        default: null,
    },
    blockchainStatus: {
        type: String,
        default: 'NOT_CONNECTED',
    },
    blockchainRegisteredAt: {
        type: Date,
        default: null,
    },
    ipfsHash: {
        type: String,
        default: null,
    },
    ipfsUrl: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});
certificateSchema.index({ createdAt: -1 });
exports.Certificate = (0, mongoose_1.model)('Certificate', certificateSchema);
