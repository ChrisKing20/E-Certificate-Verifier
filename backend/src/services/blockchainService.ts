import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract ABI containing register, verify, revoke, and getCertificate
export const CERTIFICATE_REGISTRY_ABI = [
  'function registerCertificate(string memory certificateId, bytes32 certificateHash) external',
  'function verifyCertificate(string memory certificateId, bytes32 certificateHash) external view returns (bool isValid, bool isRevoked)',
  'function revokeCertificate(string memory certificateId, string memory reason) external',
  'function isCertificateRegistered(string memory certificateId) external view returns (bool)',
  'function getCertificate(string memory certificateId) external view returns (string id, bytes32 certificateHash, address issuer, uint256 registeredAt, bool revoked, uint256 revokedAt, string revocationReason)',
  'event CertificateRegistered(string indexed certificateId, bytes32 indexed certificateHash, address indexed issuer, uint256 registeredAt)',
  'event CertificateRevoked(string indexed certificateId, bytes32 indexed certificateHash, string reason, uint256 revokedAt)'
];

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
  const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  const contractAddress = process.env.CONTRACT_ADDRESS || process.env.VITE_CERTIFICATE_CONTRACT_ADDRESS;

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return { error: 'CONTRACT_ADDRESS environment variable is not configured.' };
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, provider);
    return { provider, contract, contractAddress, network: 'Ethereum Sepolia (11155111)' };
  } catch (err: any) {
    return { error: err.message || 'Failed to initialize blockchain provider.' };
  }
};

/**
 * Verify Certificate against Smart Contract on Ethereum Sepolia (Read-Only via RPC)
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
    console.error('[Blockchain Verification Read-Only Error]:', err.message || err);
    return {
      isRegisteredOnChain: false,
      isValidOnChain: false,
      isRevokedOnChain: false,
      onChainHashMatches: false,
    };
  }
};
