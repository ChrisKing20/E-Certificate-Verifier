import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract ABI containing register, verify, revoke, and getCertificate
const CERTIFICATE_REGISTRY_ABI = [
  'function registerCertificate(string calldata certificateId, bytes32 certificateHash) external',
  'function verifyCertificate(string calldata certificateId, bytes32 certificateHash) external view returns (bool isValid, bool isRevoked)',
  'function revokeCertificate(string calldata certificateId, string calldata reason) external',
  'function isCertificateRegistered(string calldata certificateId) external view returns (bool)',
  'function getCertificate(string calldata certificateId) external view returns (string id, bytes32 certificateHash, address issuer, uint256 registeredAt, bool revoked, uint256 revokedAt, string revocationReason)',
  'event CertificateRegistered(string indexed certificateId, bytes32 indexed certificateHash, address indexed issuer, uint256 registeredAt)',
  'event CertificateRevoked(string indexed certificateId, bytes32 indexed certificateHash, string reason, uint256 revokedAt)'
];

export interface BlockchainRegisterResult {
  success: boolean;
  status: 'CONFIRMED' | 'FAILED' | 'NOT_CONNECTED';
  transactionHash?: string | null;
  contractAddress?: string | null;
  network?: string;
  bytes32Hash?: string | null;
  error?: string | null;
}

export interface BlockchainVerifyResult {
  isRegisteredOnChain: boolean;
  isValidOnChain: boolean;
  isRevokedOnChain: boolean;
  onChainHashMatches: boolean;
  contractAddress?: string | null;
  network?: string;
  onChainHash?: string | null;
}

/**
 * Format SHA-256 hex string to bytes32 hex string
 */
export const formatHashToBytes32 = (hexHash: string): string => {
  const cleanHex = hexHash.replace(/^0x/i, '');
  return ethers.zeroPadValue('0x' + cleanHex, 32);
};

const getProviderAndContract = () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return { error: 'CONTRACT_ADDRESS environment variable is not configured.' };
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    if (privateKey && privateKey !== '0x0000000000000000000000000000000000000000000000000000000000000001') {
      const signer = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, signer);
      return { provider, signer, contract, contractAddress, network: 'Ethereum Sepolia (11155111)' };
    } else {
      const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, provider);
      return { provider, contract, contractAddress, network: 'Ethereum Sepolia (11155111)' };
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to initialize blockchain provider.' };
  }
};

/**
 * Register Certificate SHA-256 Hash on Ethereum Sepolia Blockchain
 */
export const registerCertificateOnChain = async (
  certificateId: string,
  fileHashHex: string
): Promise<BlockchainRegisterResult> => {
  const conn = getProviderAndContract();

  if (conn.error || !conn.contract || !conn.signer) {
    console.log(`[Blockchain Service] Registration skipped or failed: ${conn.error || 'No signer/private key configured.'}`);
    return {
      success: false,
      status: 'FAILED',
      error: conn.error || 'Server private key not configured for Sepolia network execution.',
    };
  }

  try {
    const bytes32Hash = formatHashToBytes32(fileHashHex);

    console.log(`[Blockchain Service] Submitting registerCertificate for ID ${certificateId} to ${conn.contractAddress}...`);
    const tx = await conn.contract.registerCertificate(certificateId, bytes32Hash);
    
    // Wait for 1 block confirmation
    const receipt = await tx.wait(1);

    console.log(`[Blockchain Service] Transaction Confirmed: ${receipt.hash}`);

    return {
      success: true,
      status: 'CONFIRMED',
      transactionHash: receipt.hash,
      contractAddress: conn.contractAddress,
      network: conn.network,
      bytes32Hash: bytes32Hash,
    };
  } catch (err: any) {
    console.error('[Blockchain Service Error]:', err.message || err);
    return {
      success: false,
      status: 'FAILED',
      error: err.message || 'Blockchain transaction execution reverted or failed.',
    };
  }
};

/**
 * Verify Certificate against Smart Contract on Ethereum Sepolia
 */
export const verifyCertificateOnChain = async (
  certificateId: string,
  fileHashHex: string
): Promise<BlockchainVerifyResult> => {
  const conn = getProviderAndContract();

  if (conn.error || !conn.contract) {
    return {
      isRegisteredOnChain: false,
      isValidOnChain: false,
      isRevokedOnChain: false,
      onChainHashMatches: false,
    };
  }

  try {
    const bytes32Hash = formatHashToBytes32(fileHashHex);
    const isRegistered = await conn.contract.isCertificateRegistered(certificateId);

    if (!isRegistered) {
      return {
        isRegisteredOnChain: false,
        isValidOnChain: false,
        isRevokedOnChain: false,
        onChainHashMatches: false,
        contractAddress: conn.contractAddress,
        network: conn.network,
      };
    }

    const [isValid, isRevoked] = await conn.contract.verifyCertificate(certificateId, bytes32Hash);
    const certDetails = await conn.contract.getCertificate(certificateId);

    return {
      isRegisteredOnChain: true,
      isValidOnChain: isValid,
      isRevokedOnChain: isRevoked,
      onChainHashMatches: certDetails.certificateHash.toLowerCase() === bytes32Hash.toLowerCase(),
      contractAddress: conn.contractAddress,
      network: conn.network,
      onChainHash: certDetails.certificateHash,
    };
  } catch (err: any) {
    console.error('[Blockchain Verification Error]:', err.message || err);
    return {
      isRegisteredOnChain: false,
      isValidOnChain: false,
      isRevokedOnChain: false,
      onChainHashMatches: false,
    };
  }
};

/**
 * Revoke Certificate on Ethereum Sepolia Blockchain
 */
export const revokeCertificateOnChain = async (
  certificateId: string,
  reason: string
): Promise<{ success: boolean; transactionHash?: string | null; error?: string | null }> => {
  const conn = getProviderAndContract();

  if (conn.error || !conn.contract || !conn.signer) {
    return {
      success: false,
      error: conn.error || 'No signer wallet configured for on-chain revocation.',
    };
  }

  try {
    console.log(`[Blockchain Service] Revoking certificate ${certificateId} on-chain...`);
    const tx = await conn.contract.revokeCertificate(certificateId, reason);
    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (err: any) {
    console.error('[Blockchain Revocation Error]:', err.message || err);
    return {
      success: false,
      error: err.message || 'On-chain revocation failed.',
    };
  }
};
