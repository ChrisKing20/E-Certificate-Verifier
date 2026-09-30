import { Certificate } from './certificate';

export type VerificationResultStatus =
  | 'VALID'
  | 'INVALID'
  | 'REVOKED'
  | 'NOT_FOUND'
  | 'HASH_MISMATCH'
  | 'INTEGRITY_WARNING'
  | 'BLOCKCHAIN_MISMATCH';

export interface VerificationResultData {
  success?: boolean;
  status: VerificationResultStatus;
  message?: string;
  reason?: string;
  duplicateNotice?: boolean;
  certificate?: Certificate;
  verifiedAt: string;
  searchedTerm?: string;
  method?: 'number' | 'pdf' | 'qr';
}

export interface VerificationLogItem {
  id: string;
  certificateId: string | null;
  verificationMethod: 'CERTIFICATE_NUMBER' | 'PDF' | 'QR';
  result: VerificationResultStatus;
  verifiedAt: string;
  ipAddress: string;
  userAgent: string;
  responseTimeMs?: number;
  certificate?: {
    recipientName?: string;
    eventName?: string;
  };
}
