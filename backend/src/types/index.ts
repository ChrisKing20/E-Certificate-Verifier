import { Request } from 'express';

export interface UserPayload {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  institutionId?: string | null;
}

export type AdminPayload = UserPayload;

export interface AuthRequest extends Request {
  user?: UserPayload;
  admin?: UserPayload;
  file?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface VerificationResponse {
  success: boolean;
  status: 'VALID' | 'INVALID' | 'REVOKED' | 'NOT_FOUND' | 'HASH_MISMATCH';
  message?: string;
  reason?: string;
  duplicateNotice?: boolean;
  certificate?: {
    certificateId: string;
    recipientName: string;
    recipientEmail?: string;
    eventName: string;
    eventDate: string;
    department?: string | null;
    certificateType?: string | null;
    fileHash: string;
    issuedAt: string;
    status: string;
    revokedAt?: string | null;
    revocationReason?: string | null;
    qrCodePath?: string | null;
    blockchainNetwork?: string | null;
    blockchainContractAddress?: string | null;
    blockchainTransactionId?: string | null;
    blockchainCertificateHash?: string | null;
    blockchainStatus: string;
  };
  verifiedAt: string;
}
