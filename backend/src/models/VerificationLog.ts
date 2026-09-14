import { Schema, model, Document } from 'mongoose';

export type VerificationMethodType = 'CERTIFICATE_NUMBER' | 'PDF' | 'QR';
export type VerificationResultType = 'VALID' | 'INVALID' | 'REVOKED' | 'NOT_FOUND' | 'HASH_MISMATCH';

export interface IVerificationLog extends Document {
  certificateId?: string | null;
  verificationMethod: VerificationMethodType;
  result: VerificationResultType;
  verifiedAt: Date;
  ipAddress: string;
  userAgent: string;
  responseTimeMs?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const verificationLogSchema = new Schema<IVerificationLog>(
  {
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
  },
  {
    timestamps: true,
  }
);

verificationLogSchema.index({ certificateId: 1 });
verificationLogSchema.index({ verificationMethod: 1 });
verificationLogSchema.index({ result: 1 });
verificationLogSchema.index({ verifiedAt: -1 });

export const VerificationLog = model<IVerificationLog>('VerificationLog', verificationLogSchema);
