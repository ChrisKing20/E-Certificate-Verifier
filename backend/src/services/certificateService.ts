import { Certificate, ICertificate, BlockchainStatus } from '../models/Certificate';
import { calculateSHA256 } from '../utils/hashFile';
import { generateCertificateId } from '../utils/generateCertificateId';
import { generateQRCode } from './qrService';

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

  // 4. Save to MongoDB via Mongoose (Initial state: NOT_REGISTERED)
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
    blockchainStatus: 'NOT_REGISTERED',
    blockchainRegisteredAt: null,
  });

  return {
    certificate,
    qrDataUrl,
  };
};

export const retryBlockchainRegistration = async (id: string) => {
  const cert = await Certificate.findOne({
    $or: [{ _id: id }, { certificateId: id }],
  });

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
  const cert = await Certificate.findOne({
    $or: [{ _id: id }, { certificateId: id }],
  });

  if (!cert) {
    throw { statusCode: 404, message: 'Certificate record not found.' };
  }

  const validStatuses: BlockchainStatus[] = [
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

  await cert.save();

  return {
    certificate: cert,
  };
};
