export type CertificateStatus = 'VALID' | 'REVOKED';

export interface Certificate {
  id?: string;
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
  blockchainCertificateHash?: string | null;
  blockchainRegisteredAt?: string | null;
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
