import { Schema, model, Document } from 'mongoose';

export type VerificationMethodType = 'CERTIFICATE_NUMBER' | 'PDF' | 'QR';
export type VerificationResultType =
  | 'VALID'
  | 'INVALID'
  | 'REVOKED'
  | 'NOT_FOUND'
  | 'HASH_MISMATCH'
  | 'INTEGRITY_WARNING';

export interface IVerificationLog extends Document {
  certificateId?: string | null;
  institutionId?: Schema.Types.ObjectId | string | null;
  verificationMethod: VerificationMethodType;
  result: VerificationResultType;
  verifiedAt: Date;
  ipAddress: string;
  userAgent: string;
  responseTimeMs?: number | null;
  blockchainChecked?: boolean;
  blockchainResult?: any;
  createdAt: Date;
  updatedAt: Date;
}

const verificationLogSchema = new Schema<IVerificationLog>(
  {
    certificateId: {
      type: String,
      default: null,
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
      index: true,
    },
    verificationMethod: {
      type: String,
      enum: ['CERTIFICATE_NUMBER', 'PDF', 'QR'],
      required: true,
    },
    result: {
      type: String,
      enum: ['VALID', 'INVALID', 'REVOKED', 'NOT_FOUND', 'HASH_MISMATCH', 'INTEGRITY_WARNING'],
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
    blockchainChecked: {
      type: Boolean,
      default: false,
    },
    blockchainResult: {
      type: Schema.Types.Mixed,
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
