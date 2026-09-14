"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeCertificateOnChain = exports.verifyCertificateOnChain = exports.registerCertificateOnChain = exports.formatHashToBytes32 = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
/**
 * Format SHA-256 hex string to bytes32 hex string
 */
const formatHashToBytes32 = (hexHash) => {
    const cleanHex = hexHash.replace(/^0x/i, '');
    return ethers_1.ethers.zeroPadValue('0x' + cleanHex, 32);
};
exports.formatHashToBytes32 = formatHashToBytes32;
const getProviderAndContract = () => {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        return { error: 'CONTRACT_ADDRESS environment variable is not configured.' };
    }
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        if (privateKey && privateKey !== '0x0000000000000000000000000000000000000000000000000000000000000001') {
            const signer = new ethers_1.ethers.Wallet(privateKey, provider);
            const contract = new ethers_1.ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, signer);
            return { provider, signer, contract, contractAddress, network: 'Ethereum Sepolia (11155111)' };
        }
        else {
            const contract = new ethers_1.ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, provider);
            return { provider, contract, contractAddress, network: 'Ethereum Sepolia (11155111)' };
        }
    }
    catch (err) {
        return { error: err.message || 'Failed to initialize blockchain provider.' };
    }
};
/**
 * Register Certificate SHA-256 Hash on Ethereum Sepolia Blockchain
 */
const registerCertificateOnChain = async (certificateId, fileHashHex) => {
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
        const bytes32Hash = (0, exports.formatHashToBytes32)(fileHashHex);
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
    }
    catch (err) {
        console.error('[Blockchain Service Error]:', err.message || err);
        return {
            success: false,
            status: 'FAILED',
            error: err.message || 'Blockchain transaction execution reverted or failed.',
        };
    }
};
exports.registerCertificateOnChain = registerCertificateOnChain;
/**
 * Verify Certificate against Smart Contract on Ethereum Sepolia
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
        console.error('[Blockchain Verification Error]:', err.message || err);
        return {
            isRegisteredOnChain: false,
            isValidOnChain: false,
            isRevokedOnChain: false,
            onChainHashMatches: false,
        };
    }
};
exports.verifyCertificateOnChain = verifyCertificateOnChain;
/**
 * Revoke Certificate on Ethereum Sepolia Blockchain
 */
const revokeCertificateOnChain = async (certificateId, reason) => {
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
    }
    catch (err) {
        console.error('[Blockchain Revocation Error]:', err.message || err);
        return {
            success: false,
            error: err.message || 'On-chain revocation failed.',
        };
    }
};
exports.revokeCertificateOnChain = revokeCertificateOnChain;
