"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationLog = void 0;
const mongoose_1 = require("mongoose");
const verificationLogSchema = new mongoose_1.Schema({
    certificateId: {
        type: String,
        default: null,
    },
    verificationMethod: {
        type: String,
        enum: ['CERTIFICATE_NUMBER', 'PDF', 'QR'],
        required: true,
    },
    result: {
        type: String,
        enum: ['VALID', 'INVALID', 'REVOKED', 'NOT_FOUND', 'HASH_MISMATCH'],
        required: true,
    },
    verifiedAt: {
        type: Date,
        default: Date.now,
    },
    ipAddress: {
        type: String,
        default: '127.0.0.1',
    },
    userAgent: {
        type: String,
        default: 'Unknown',
    },
    responseTimeMs: {
        type: Number,
        default: null,
    },
}, {
    timestamps: true,
});
verificationLogSchema.index({ certificateId: 1 });
verificationLogSchema.index({ verificationMethod: 1 });
verificationLogSchema.index({ result: 1 });
verificationLogSchema.index({ verifiedAt: -1 });
exports.VerificationLog = (0, mongoose_1.model)('VerificationLog', verificationLogSchema);
