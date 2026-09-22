import { Certificate, ICertificate } from '../models/Certificate';
import { VerificationLog } from '../models/VerificationLog';
import { calculateSHA256 } from '../utils/hashFile';
import { verifyCertificateOnChain } from './blockchainService';

const formatVerifiedAt = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const verifyByCertificateNumber = async (
  certNumber: string,
  ipAddress: string = '127.0.0.1',
  userAgent: string = 'Unknown'
) => {
  const startTime = Date.now();
  const normalizedNumber = certNumber.trim().toUpperCase();
  const now = new Date();
  const verifiedAtStr = formatVerifiedAt(now);

  if (!normalizedNumber) {
    return {
      success: false,
      status: 'INVALID',
      message: 'Please provide a valid certificate number.',
      reason: 'Empty certificate number submitted.',
      verifiedAt: verifiedAtStr,
    };
  }

  let certificate: ICertificate | null = null;

  try {
    certificate = await Certificate.findOne({ certificateId: normalizedNumber });
  } catch (err) {
    console.log('MongoDB query notice: database connection offline or starting.');
  }

  if (!certificate) {
    try {
      await VerificationLog.create({
        certificateId: normalizedNumber,
        verificationMethod: 'CERTIFICATE_NUMBER',
        result: 'NOT_FOUND',
        ipAddress,
        userAgent,
        responseTimeMs: Date.now() - startTime,
        blockchainChecked: false,
      });
    } catch (_e) {}

    return {
      success: false,
      status: 'NOT_FOUND',
      message: 'Certificate not found in institutional registry.',
      reason: 'The specified certificate number does not match any registered record in MongoDB.',
      verifiedAt: verifiedAtStr,
    };
  }

  // Check on-chain integrity if configured
  const chainCheck = await verifyCertificateOnChain(certificate.certificateId, certificate.fileHash);

  let status: any = certificate.status === 'REVOKED' ? 'REVOKED' : 'VALID';
  let warningReason: string | undefined = undefined;

  if (chainCheck.isRegisteredOnChain) {
    if (!chainCheck.onChainHashMatches) {
      status = 'INTEGRITY_WARNING';
      warningReason = 'INTEGRITY WARNING: The document hash does not match the immutable hash on Ethereum blockchain!';
    } else if (chainCheck.isRevokedOnChain && certificate.status !== 'REVOKED') {
      status = 'INTEGRITY_WARNING';
      warningReason = 'INTEGRITY WARNING: Blockchain record is REVOKED, but MongoDB status shows VALID!';
    } else if (!chainCheck.isRevokedOnChain && certificate.status === 'REVOKED') {
      status = 'INTEGRITY_WARNING';
      warningReason = 'INTEGRITY WARNING: MongoDB status shows REVOKED, but Blockchain smart contract is still active!';
    }
  }

  try {
    await VerificationLog.create({
      certificateId: certificate.certificateId,
      verificationMethod: 'CERTIFICATE_NUMBER',
      result: status,
      ipAddress,
      userAgent,
      responseTimeMs: Date.now() - startTime,
      blockchainChecked: chainCheck.isRegisteredOnChain,
      blockchainResult: chainCheck,
    });
  } catch (_e) {}

  return {
    success: status === 'VALID' || status === 'REVOKED',
    status,
    message:
      status === 'INTEGRITY_WARNING'
        ? 'INTEGRITY WARNING: Discrepancy detected between MongoDB database and Ethereum Blockchain status!'
        : status === 'REVOKED'
        ? 'Certificate found but has been REVOKED.'
        : 'Certificate authenticity confirmed.',
    reason:
      warningReason ||
      (status === 'REVOKED'
        ? certificate.revocationReason || 'This certificate was revoked by the issuing authority.'
        : undefined),
    certificate: {
      certificateId: certificate.certificateId,
      recipientName: certificate.recipientName,
      recipientEmail: certificate.recipientEmail,
      eventName: certificate.eventName,
      eventDate: certificate.eventDate,
      department: certificate.department,
      certificateType: certificate.certificateType,
      fileHash: certificate.fileHash,
      issuedAt: certificate.issuedAt.toISOString(),
      status: certificate.status,
      revokedAt: certificate.revokedAt ? certificate.revokedAt.toISOString() : null,
      revocationReason: certificate.revocationReason,
      qrCodePath: certificate.qrCodePath,
      blockchainNetwork: certificate.blockchainNetwork,
      blockchainContractAddress: certificate.blockchainContractAddress,
      blockchainTransactionId: certificate.blockchainTransactionId,
      blockchainBlockNumber: certificate.blockchainBlockNumber,
      blockchainCertificateHash: certificate.blockchainCertificateHash,
      blockchainStatus: certificate.blockchainStatus,
      blockchainIssuer: certificate.blockchainIssuer,
      blockchainRegisteredAt: certificate.blockchainRegisteredAt
        ? certificate.blockchainRegisteredAt.toISOString()
        : null,
      ipfsCid: certificate.ipfsCid || certificate.ipfsHash || null,
      ipfsGatewayUrl: certificate.ipfsGatewayUrl || certificate.ipfsUrl || null,
      storageType: certificate.storageType || (certificate.ipfsCid ? 'IPFS' : 'LOCAL'),
    },
    verifiedAt: verifiedAtStr,
  };
};

export const verifyByPdfHash = async (
  fileBuffer: Buffer,
  ipAddress: string = '127.0.0.1',
  userAgent: string = 'Unknown'
) => {
  const startTime = Date.now();
  const now = new Date();
  const verifiedAtStr = formatVerifiedAt(now);

  const calculatedHash = calculateSHA256(fileBuffer);
  let certificate: ICertificate | null = null;

  try {
    certificate = await Certificate.findOne({ fileHash: calculatedHash });
  } catch (err) {
    console.log('MongoDB query notice: database connection offline or starting.');
  }

  if (!certificate) {
    try {
      await VerificationLog.create({
        certificateId: null,
        verificationMethod: 'PDF',
        result: 'HASH_MISMATCH',
        ipAddress,
        userAgent,
        responseTimeMs: Date.now() - startTime,
        blockchainChecked: false,
      });
    } catch (_e) {}

    return {
      success: false,
      status: 'HASH_MISMATCH',
      message: 'PDF Verification Failed.',
      reason: `Calculated document hash (${calculatedHash.slice(0, 16)}...) does not match any registered certificate in our MongoDB database. The document may be modified or forged.`,
      verifiedAt: verifiedAtStr,
    };
  }

  let previousVerificationsCount = 0;
  try {
    previousVerificationsCount = await VerificationLog.countDocuments({
      certificateId: certificate.certificateId,
      verificationMethod: 'PDF',
    });
  } catch (_e) {}

  const chainCheck = await verifyCertificateOnChain(certificate.certificateId, calculatedHash);
  let status: any = certificate.status === 'REVOKED' ? 'REVOKED' : 'VALID';
  let warningReason: string | undefined = undefined;

  if (chainCheck.isRegisteredOnChain) {
    if (!chainCheck.onChainHashMatches) {
      status = 'INTEGRITY_WARNING';
      warningReason = 'INTEGRITY WARNING: The PDF file SHA-256 hash does not match the immutable record on Ethereum!';
    } else if (chainCheck.isRevokedOnChain && certificate.status !== 'REVOKED') {
      status = 'INTEGRITY_WARNING';
      warningReason = 'INTEGRITY WARNING: Blockchain record is REVOKED, but MongoDB status shows VALID!';
    } else if (!chainCheck.isRevokedOnChain && certificate.status === 'REVOKED') {
      status = 'INTEGRITY_WARNING';
      warningReason = 'INTEGRITY WARNING: MongoDB status shows REVOKED, but Blockchain smart contract is still active!';
    }
  }

  try {
    await VerificationLog.create({
      certificateId: certificate.certificateId,
      verificationMethod: 'PDF',
      result: status,
      ipAddress,
      userAgent,
      responseTimeMs: Date.now() - startTime,
      blockchainChecked: chainCheck.isRegisteredOnChain,
      blockchainResult: chainCheck,
    });
  } catch (_e) {}

  return {
    success: status === 'VALID' || status === 'REVOKED',
    status,
    message:
      status === 'INTEGRITY_WARNING'
        ? 'INTEGRITY WARNING: Discrepancy detected between MongoDB database and Ethereum Blockchain status!'
        : status === 'REVOKED'
        ? 'PDF matches registered record, but certificate has been REVOKED.'
        : 'Authentic PDF Certificate Verified.',
    duplicateNotice: previousVerificationsCount > 0,
    reason: warningReason,
    certificate: {
      certificateId: certificate.certificateId,
      recipientName: certificate.recipientName,
      recipientEmail: certificate.recipientEmail,
      eventName: certificate.eventName,
      eventDate: certificate.eventDate,
      department: certificate.department,
      certificateType: certificate.certificateType,
      fileHash: certificate.fileHash,
      issuedAt: certificate.issuedAt.toISOString(),
      status: certificate.status,
      revokedAt: certificate.revokedAt ? certificate.revokedAt.toISOString() : null,
      revocationReason: certificate.revocationReason,
      qrCodePath: certificate.qrCodePath,
      blockchainNetwork: certificate.blockchainNetwork,
      blockchainContractAddress: certificate.blockchainContractAddress,
      blockchainTransactionId: certificate.blockchainTransactionId,
      blockchainBlockNumber: certificate.blockchainBlockNumber,
      blockchainCertificateHash: certificate.blockchainCertificateHash,
      blockchainStatus: certificate.blockchainStatus,
      blockchainIssuer: certificate.blockchainIssuer,
      blockchainRegisteredAt: certificate.blockchainRegisteredAt
        ? certificate.blockchainRegisteredAt.toISOString()
        : null,
      ipfsCid: certificate.ipfsCid || certificate.ipfsHash || null,
      ipfsGatewayUrl: certificate.ipfsGatewayUrl || certificate.ipfsUrl || null,
      storageType: certificate.storageType || (certificate.ipfsCid ? 'IPFS' : 'LOCAL'),
    },
    verifiedAt: verifiedAtStr,
  };
};

export const getVerificationLogs = async (query: { page?: number; limit?: number }) => {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 20;
  const skip = (page - 1) * limit;

  try {
    const total = await VerificationLog.countDocuments();
    const logs = await VerificationLog.find()
      .sort({ verifiedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    return {
      logs: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }
};
