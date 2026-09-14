import { Certificate, ICertificate } from '../models/Certificate';
import { calculateSHA256 } from '../utils/hashFile';
import { generateCertificateId } from '../utils/generateCertificateId';
import { generateQRCode } from './qrService';
import {
  registerCertificateOnChain,
  revokeCertificateOnChain,
} from './blockchainService';

export interface CreateCertificateDto {
  recipientName: string;
  recipientEmail: string;
  eventName: string;
  eventDate: string;
  department?: string;
  certificateType?: string;
  fileBuffer: Buffer;
  filePath: string;
}

export const createCertificate = async (data: CreateCertificateDto) => {
  // 1. Calculate SHA-256 hash from actual PDF file buffer
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

  // 3. Generate QR code
  const { qrDataUrl, qrFilePath } = await generateQRCode(certificateId);

  // 4. Register on Blockchain (Fault Tolerant)
  const chainRes = await registerCertificateOnChain(certificateId, fileHash);

  // 5. Save to MongoDB via Mongoose
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
    blockchainNetwork: chainRes.network || 'Ethereum Sepolia (11155111)',
    blockchainContractAddress: chainRes.contractAddress || process.env.CONTRACT_ADDRESS || null,
    blockchainTransactionId: chainRes.transactionHash || null,
    blockchainCertificateHash: chainRes.bytes32Hash || null,
    blockchainStatus: chainRes.status,
    blockchainRegisteredAt: chainRes.success ? new Date() : null,
  });

  return {
    certificate,
    qrDataUrl,
    blockchainResult: chainRes,
  };
};

export const retryBlockchainRegistration = async (id: string) => {
  const cert = await Certificate.findOne({
    $or: [{ _id: id }, { certificateId: id }],
  });

  if (!cert) {
    throw { statusCode: 404, message: 'Certificate not found.' };
  }

  if (cert.blockchainStatus === 'CONFIRMED') {
    throw { statusCode: 400, message: 'Certificate is already confirmed on blockchain.' };
  }

  const chainRes = await registerCertificateOnChain(cert.certificateId, cert.fileHash);

  cert.blockchainNetwork = chainRes.network || cert.blockchainNetwork;
  cert.blockchainContractAddress = chainRes.contractAddress || cert.blockchainContractAddress;
  cert.blockchainTransactionId = chainRes.transactionHash || cert.blockchainTransactionId;
  cert.blockchainCertificateHash = chainRes.bytes32Hash || cert.blockchainCertificateHash;
  cert.blockchainStatus = chainRes.status;
  if (chainRes.success) {
    cert.blockchainRegisteredAt = new Date();
  }

  await cert.save();

  return {
    certificate: cert,
    blockchainResult: chainRes,
  };
};

export const getCertificates = async (query: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const skip = (page - 1) * limit;

  const filter: any = {};

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
  const certificate = await Certificate.findOne({
    $or: [{ _id: id }, { certificateId: id }],
  });

  if (!certificate) {
    throw { statusCode: 404, message: 'Certificate record not found.' };
  }

  return certificate;
};

export const revokeCertificate = async (id: string, reason: string) => {
  const cert = await Certificate.findOne({
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

  // Attempt on-chain revocation
  const chainRes = await revokeCertificateOnChain(cert.certificateId, reason);
  if (chainRes.success) {
    cert.blockchainStatus = 'REVOKED';
    if (chainRes.transactionHash) {
      cert.blockchainTransactionId = chainRes.transactionHash;
    }
  }

  await cert.save();

  return {
    certificate: cert,
    blockchainRevocation: chainRes,
  };
};
