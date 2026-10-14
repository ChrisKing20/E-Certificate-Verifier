import { Schema, model, Document } from 'mongoose';

export type CertificateStatus = 'VALID' | 'REVOKED';

export type StorageType = 'IPFS' | 'LOCAL';

export type BlockchainStatus =
  | 'DATABASE_CREATED'
  | 'IPFS_UPLOADED'
  | 'BLOCKCHAIN_PENDING'
  | 'BLOCKCHAIN_CONFIRMED'
  | 'BLOCKCHAIN_FAILED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REVOKED'
  | 'NOT_REGISTERED';

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
  blockchainBlockNumber?: number | null;
  blockchainCertificateHash?: string | null;
  blockchainStatus: BlockchainStatus;
  blockchainRegisteredAt?: Date | null;
  blockchainIssuer?: string | null;
  ipfsCid?: string | null;
  ipfsGatewayUrl?: string | null;
  ipfsQrCid?: string | null;
  ipfsQrGatewayUrl?: string | null;
  ipfsHash?: string | null;
  ipfsUrl?: string | null;
  storageType: StorageType;
  institutionId?: Schema.Types.ObjectId | string | null;
  issuedBy?: Schema.Types.ObjectId | string | null;
  recipientUserId?: Schema.Types.ObjectId | string | null;
  /**
   * When this certificate is an authorized replacement, supersededById records the
   * _id of the original (revoked/superseded) certificate. This is optional and only
   * set by the reissuance workflow — never by the standard issuance path.
   */
  supersededById?: Schema.Types.ObjectId | string | null;
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
    blockchainBlockNumber: {
      type: Number,
      default: null,
    },
    blockchainCertificateHash: {
      type: String,
      default: null,
    },
    blockchainStatus: {
      type: String,
      enum: [
        'DATABASE_CREATED',
        'IPFS_UPLOADED',
        'BLOCKCHAIN_PENDING',
        'BLOCKCHAIN_CONFIRMED',
        'BLOCKCHAIN_FAILED',
        'PENDING',
        'CONFIRMED',
        'FAILED',
        'REVOKED',
        'NOT_REGISTERED',
      ],
      default: 'NOT_REGISTERED',
    },
    blockchainRegisteredAt: {
      type: Date,
      default: null,
    },
    blockchainIssuer: {
      type: String,
      default: null,
    },
    ipfsCid: {
      type: String,
      default: null,
    },
    ipfsGatewayUrl: {
      type: String,
      default: null,
    },
    ipfsQrCid: {
      type: String,
      default: null,
    },
    ipfsQrGatewayUrl: {
      type: String,
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
    storageType: {
      type: String,
      enum: ['IPFS', 'LOCAL'],
      default: 'LOCAL',
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
      index: true,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    supersededById: {
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ createdAt: -1 });
certificateSchema.index({ recipientEmail: 1 });

/**
 * Compound logical-duplicate index.
 *
 * Prevents a second certificate from being issued by the same institution
 * for the exact same recipient/event/date/type/department combination.
 *
 * The partial filter expression restricts the index to documents where
 * institutionId is NOT null, so institution-less (legacy/SUPER_ADMIN) records
 * are excluded from the uniqueness constraint.
 *
 * If you need to drop and recreate this index after deployment run:
 *   db.certificates.dropIndex('logical_duplicate_prevention')
 */
certificateSchema.index(
  {
    institutionId: 1,
    recipientEmail: 1,
    eventName: 1,
    eventDate: 1,
    certificateType: 1,
    department: 1,
  },
  {
    name: 'logical_duplicate_prevention',
    unique: true,
    sparse: true,
    partialFilterExpression: { institutionId: { $exists: true, $ne: null } },
    background: true,
  }
);

export const Certificate = model<ICertificate>('Certificate', certificateSchema);
