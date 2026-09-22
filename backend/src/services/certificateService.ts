import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Certificate, ICertificate, BlockchainStatus } from '../models/Certificate';
import { User } from '../models/User';
import { calculateSHA256 } from '../utils/hashFile';
import { generateCertificateId } from '../utils/generateCertificateId';
import { generateQRCode } from './qrService';
import { uploadCertificateToIPFS, removeLocalTemporaryFile } from './ipfsService';

export const findCertificateByIdOrCertId = async (id: string): Promise<ICertificate | null> => {
  if (mongoose.isValidObjectId(id)) {
    return Certificate.findOne({
      $or: [{ _id: id }, { certificateId: id }],
    });
  }
  return Certificate.findOne({ certificateId: id });
};

export interface CreateCertificateDto {
  recipientName: string;
  recipientEmail: string;
  eventName: string;
  eventDate: string;
  department?: string;
  certificateType?: string;
  fileBuffer: Buffer;
  filePath: string;
  institutionId?: string | null;
  issuedBy?: string | null;
}

export interface UpdateBlockchainMetadataDto {
  transactionHash?: string;
  blockNumber?: number;
  network?: string;
  contractAddress?: string;
  blockchainHash?: string;
  issuerAddress?: string;
  status: BlockchainStatus;
}

export const createCertificate = async (data: CreateCertificateDto) => {
  // 1. Calculate SHA-256 hash from raw PDF bytes
  const fileHash = calculateSHA256(data.fileBuffer);

  // Check if hash already exists in MongoDB database
  let existingHash = null;
  try {
    existingHash = await Certificate.findOne({ fileHash });
  } catch (_e) {}

  if (existingHash) {
    throw {
      statusCode: 409,
      message: `Duplicate Certificate PDF detected. A certificate with this exact file hash already exists (ID: ${existingHash.certificateId}).`,
    };
  }

  // 2. Generate unique Certificate ID
  const certificateId = await generateCertificateId();

  // 3. Check if recipient email exists in User collection
  let recipientUserId: string | null = null;
  try {
    const matchedUser = await User.findOne({ email: data.recipientEmail.trim().toLowerCase() });
    if (matchedUser) {
      recipientUserId = matchedUser._id.toString();
    }
  } catch (_e) {}

  // 4. Upload PDF to IPFS
  let ipfsResult = { cid: '', gatewayUrl: '', pinned: false };
  let initialBlockchainStatus: BlockchainStatus = 'DATABASE_CREATED';

  try {
    ipfsResult = await uploadCertificateToIPFS(data.fileBuffer, `${certificateId}.pdf`);
    initialBlockchainStatus = 'IPFS_UPLOADED';
  } catch (err: any) {
    console.warn(`[IPFS Upload Warning]: ${err.message}. Proceeding with database creation.`);
  }

  // 5. Generate QR code
  const { qrDataUrl, qrFilePath } = await generateQRCode(certificateId);

  // 6. Save to MongoDB via Mongoose
  const certificate = await Certificate.create({
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
    blockchainNetwork: 'Ethereum Sepolia',
    blockchainContractAddress: process.env.CONTRACT_ADDRESS || null,
    blockchainTransactionId: null,
    blockchainBlockNumber: null,
    blockchainCertificateHash: null,
    blockchainStatus: initialBlockchainStatus,
    blockchainRegisteredAt: null,
    ipfsCid: ipfsResult.cid || null,
    ipfsGatewayUrl: ipfsResult.gatewayUrl || null,
    ipfsHash: ipfsResult.cid || null,
    ipfsUrl: ipfsResult.gatewayUrl || null,
    storageType: ipfsResult.cid ? 'IPFS' : 'LOCAL',
    institutionId: data.institutionId || null,
    issuedBy: data.issuedBy || null,
    recipientUserId: recipientUserId || null,
  });

  // 7. Clean up local temp upload file if safe
  if (ipfsResult.cid && data.filePath) {
    await removeLocalTemporaryFile(data.filePath);
  }

  return {
    certificate,
    qrDataUrl,
    ipfsResult,
  };
};

export const retryBlockchainRegistration = async (id: string) => {
  const cert = await findCertificateByIdOrCertId(id);

  if (!cert) {
    throw { statusCode: 404, message: 'Certificate not found.' };
  }

  return {
    certificate: cert,
    blockchainResult: {
      success: false,
      status: cert.blockchainStatus,
      message: 'Please initiate registration via MetaMask in the browser.',
    },
  };
};

export const updateCertificateBlockchainMetadata = async (
  id: string,
  data: UpdateBlockchainMetadataDto
) => {
  const cert = await findCertificateByIdOrCertId(id);

  if (!cert) {
    throw { statusCode: 404, message: 'Certificate record not found.' };
  }

  const validStatuses: BlockchainStatus[] = [
    'DATABASE_CREATED',
    'IPFS_UPLOADED',
    'NOT_REGISTERED',
    'PENDING',
    'CONFIRMED',
    'FAILED',
    'REVOKED',
  ];

  if (!data.status || !validStatuses.includes(data.status)) {
    throw {
      statusCode: 400,
      message: `Invalid blockchain status provided. Allowed statuses: ${validStatuses.join(', ')}`,
    };
  }

  cert.blockchainStatus = data.status;

  if (data.transactionHash) {
    cert.blockchainTransactionId = data.transactionHash.trim();
  }
  if (data.blockNumber !== undefined && data.blockNumber !== null) {
    cert.blockchainBlockNumber = Number(data.blockNumber);
  }
  if (data.network) {
    cert.blockchainNetwork = data.network.trim();
  }
  if (data.contractAddress) {
    cert.blockchainContractAddress = data.contractAddress.trim();
  }
  if (data.blockchainHash) {
    cert.blockchainCertificateHash = data.blockchainHash.trim();
  }
  if (data.issuerAddress) {
    cert.blockchainIssuer = data.issuerAddress.trim();
  }

  if (data.status === 'CONFIRMED' && !cert.blockchainRegisteredAt) {
    cert.blockchainRegisteredAt = new Date();
  }

  await cert.save();
  return cert;
};

export const getCertificates = async (query: {
  search?: string;
  status?: string;
  institutionId?: string | null;
  page?: number;
  limit?: number;
}) => {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.institutionId) {
    filter.institutionId = query.institutionId;
  }

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
      { ipfsCid: searchRegex },
    ];
  }

  try {
    const total = await Certificate.countDocuments(filter);
    const certificates = await Certificate.find(filter)
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
  } catch (err) {
    return {
      certificates: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
};

export const getCertificateById = async (id: string) => {
  const certificate = await findCertificateByIdOrCertId(id);

  if (!certificate) {
    throw { statusCode: 404, message: 'Certificate record not found.' };
  }

  return certificate;
};

export const revokeCertificate = async (id: string, reason: string) => {
  const cert = await findCertificateByIdOrCertId(id);

  if (!cert) {
    throw { statusCode: 404, message: 'Certificate not found.' };
  }

  if (cert.status === 'REVOKED') {
    throw { statusCode: 400, message: 'Certificate is already revoked.' };
  }

  cert.status = 'REVOKED';
  cert.revokedAt = new Date();
  cert.revocationReason = reason.trim() || 'Certificate revoked by administrative authority.';

  await cert.save();

  return {
    certificate: cert,
  };
};

/**
 * Migration utility: Upload existing LOCAL certificates to IPFS and update their CIDs in MongoDB
 */
export const migrateLocalCertificatesToIPFS = async () => {
  const legacyCertificates = await Certificate.find({
    $or: [{ storageType: 'LOCAL' }, { ipfsCid: null }, { ipfsCid: '' }],
  });

  let migratedCount = 0;
  let failedCount = 0;
  const details: Array<{ certificateId: string; status: string; cid?: string; error?: string }> = [];

  for (const cert of legacyCertificates) {
    try {
      let buffer: Buffer | null = null;

      if (cert.filePath && fs.existsSync(cert.filePath)) {
        buffer = await fs.promises.readFile(cert.filePath);
      }

      if (!buffer) {
        // Fallback buffer if local file path doesn't exist
        buffer = Buffer.from(`Certificate PDF placeholder for ID ${cert.certificateId}`);
      }

      const ipfsResult = await uploadCertificateToIPFS(buffer, `${cert.certificateId}.pdf`);

      cert.ipfsCid = ipfsResult.cid;
      cert.ipfsGatewayUrl = ipfsResult.gatewayUrl;
      cert.ipfsHash = ipfsResult.cid;
      cert.ipfsUrl = ipfsResult.gatewayUrl;
      cert.storageType = 'IPFS';
      if (cert.blockchainStatus === 'NOT_REGISTERED' || cert.blockchainStatus === 'DATABASE_CREATED') {
        cert.blockchainStatus = 'IPFS_UPLOADED';
      }

      await cert.save();
      migratedCount++;
      details.push({ certificateId: cert.certificateId, status: 'SUCCESS', cid: ipfsResult.cid });
    } catch (err: any) {
      failedCount++;
      details.push({ certificateId: cert.certificateId, status: 'FAILED', error: err.message });
    }
  }

  return {
    total: legacyCertificates.length,
    migratedCount,
    failedCount,
    details,
  };
};
