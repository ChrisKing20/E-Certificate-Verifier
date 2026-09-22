export type CertificateStatus = 'VALID' | 'REVOKED';

export interface Certificate {
  id?: string;
  _id?: string;
  certificateId: string;
  certificateNumber?: string; // fallback alias for UI compatibility
  recipientName: string;
  studentName?: string; // fallback alias
  recipientEmail?: string;
  eventName: string;
  eventDate: string;
  department?: string | null;
  certificateType?: string | null;
  issuer?: string;
  achievement?: string;
  filePath?: string;
  fileHash: string;
  hash?: string; // fallback alias
  status: CertificateStatus;
  issuedAt?: string;
  createdAt?: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
  qrCodePath?: string | null;
  blockchainStatus?: string;
  blockchainNetwork?: string;
  blockchainContractAddress?: string | null;
  blockchainTransactionId?: string | null;
  blockchainBlockNumber?: number | null;
  blockchainCertificateHash?: string | null;
  blockchainIssuer?: string | null;
  blockchainRegisteredAt?: string | null;
  ipfsCid?: string | null;
  ipfsGatewayUrl?: string | null;
  ipfsHash?: string | null;
  ipfsUrl?: string | null;
  storageType?: 'IPFS' | 'LOCAL';
}

export interface CertificateListResponse {
  success: boolean;
  data: Certificate[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
