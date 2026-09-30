export type BlockchainStatus = 'NOT_REGISTERED' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REVOKED';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
}

export interface BlockchainTxResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  contractAddress?: string;
  network?: string;
  bytes32Hash?: string;
  issuerAddress?: string;
  error?: string;
}

export interface CertificateBlockchainUpdatePayload {
  transactionHash?: string;
  blockNumber?: number;
  network?: string;
  contractAddress?: string;
  blockchainHash?: string;
  issuerAddress?: string;
  status: BlockchainStatus;
}
