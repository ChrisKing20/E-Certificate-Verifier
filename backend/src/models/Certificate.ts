import { Schema, model, Document } from 'mongoose';

export type CertificateStatus = 'VALID' | 'REVOKED';

export interface ICertificate extends Document {
  certificateId: string;
  recipientName: string;
  recipientEmail: string;
  eventName: string;
  eventDate: string;
  department?: string | null;
  certificateType?: string | null;
  filePath: string;
  fileHash: string;
  status: CertificateStatus;
  issuedAt: Date;
  revokedAt?: Date | null;
  revocationReason?: string | null;
  qrCodePath?: string | null;
  blockchainNetwork: string;
  blockchainContractAddress?: string | null;
  blockchainTransactionId?: string | null;
  blockchainCertificateHash?: string | null;
  blockchainStatus: string;
  blockchainRegisteredAt?: Date | null;
  ipfsHash?: string | null;
  ipfsUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
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
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ createdAt: -1 });

export const Certificate = model<ICertificate>('Certificate', certificateSchema);
