export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
export const SEPOLIA_NETWORK_NAME = 'Ethereum Sepolia';

export const DEFAULT_SEPOLIA_RPC =
  import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

export const DEFAULT_CONTRACT_ADDRESS =
  import.meta.env.VITE_CERTIFICATE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const CERTIFICATE_REGISTRY_ABI = [
  'function registerCertificate(string memory certificateId, bytes32 certificateHash) external',
  'function verifyCertificate(string memory certificateId, bytes32 certificateHash) external view returns (bool isValid, bool isRevoked)',
  'function revokeCertificate(string memory certificateId, string memory reason) external',
  'function isCertificateRegistered(string memory certificateId) external view returns (bool)',
  'function getCertificate(string memory certificateId) external view returns (string id, bytes32 certificateHash, address issuer, uint256 registeredAt, bool revoked, uint256 revokedAt, string revocationReason)',
  'event CertificateRegistered(string indexed certificateId, bytes32 indexed certificateHash, address indexed issuer, uint256 registeredAt)',
  'event CertificateRevoked(string indexed certificateId, bytes32 indexed certificateHash, string reason, uint256 revokedAt)'
];

export const getSepoliaExplorerTxUrl = (txHash: string): string => {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
};

export const getSepoliaExplorerAddressUrl = (address: string): string => {
  return `https://sepolia.etherscan.io/address/${address}`;
};

export const getSepoliaExplorerBlockUrl = (blockNumber: number | string): string => {
  return `https://sepolia.etherscan.io/block/${blockNumber}`;
};
