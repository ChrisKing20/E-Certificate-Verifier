"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCertificateOnChain = exports.formatHashToBytes32 = exports.CERTIFICATE_REGISTRY_ABI = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Contract ABI containing register, verify, revoke, and getCertificate
exports.CERTIFICATE_REGISTRY_ABI = [
    'function registerCertificate(string memory certificateId, bytes32 certificateHash) external',
    'function verifyCertificate(string memory certificateId, bytes32 certificateHash) external view returns (bool isValid, bool isRevoked)',
    'function revokeCertificate(string memory certificateId, string memory reason) external',
    'function isCertificateRegistered(string memory certificateId) external view returns (bool)',
    'function getCertificate(string memory certificateId) external view returns (string id, bytes32 certificateHash, address issuer, uint256 registeredAt, bool revoked, uint256 revokedAt, string revocationReason)',
    'event CertificateRegistered(string indexed certificateId, bytes32 indexed certificateHash, address indexed issuer, uint256 registeredAt)',
    'event CertificateRevoked(string indexed certificateId, bytes32 indexed certificateHash, string reason, uint256 revokedAt)'
];
/**
 * Format SHA-256 hex string to bytes32 hex string
 */
const formatHashToBytes32 = (hexHash) => {
    const cleanHex = hexHash.replace(/^0x/i, '');
    return ethers_1.ethers.zeroPadValue('0x' + cleanHex, 32);
};
exports.formatHashToBytes32 = formatHashToBytes32;
const getProviderAndContract = () => {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
    const contractAddress = process.env.CONTRACT_ADDRESS || process.env.VITE_CERTIFICATE_CONTRACT_ADDRESS;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        return { error: 'CONTRACT_ADDRESS environment variable is not configured.' };
    }
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers_1.ethers.Contract(contractAddress, exports.CERTIFICATE_REGISTRY_ABI, provider);
        return { provider, contract, contractAddress, network: 'Ethereum Sepolia (11155111)' };
    }
    catch (err) {
        return { error: err.message || 'Failed to initialize blockchain provider.' };
    }
};
/**
 * Verify Certificate against Smart Contract on Ethereum Sepolia (Read-Only via RPC)
 */
const verifyCertificateOnChain = async (certificateId, fileHashHex) => {
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
        const bytes32Hash = (0, exports.formatHashToBytes32)(fileHashHex);
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
    }
    catch (err) {
        console.error('[Blockchain Verification Read-Only Error]:', err.message || err);
        return {
            isRegisteredOnChain: false,
            isValidOnChain: false,
            isRevokedOnChain: false,
            onChainHashMatches: false,
        };
    }
};
exports.verifyCertificateOnChain = verifyCertificateOnChain;
