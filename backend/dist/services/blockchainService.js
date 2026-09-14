"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCertificateOnChain = exports.revokeCertificateOnChain = exports.registerCertificateOnChain = exports.fileHashToBytes32 = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../config");
const CONTRACT_ABI = [
    'function registerCertificate(string certificateId, bytes32 certificateHash) external',
    'function verifyCertificate(string certificateId, bytes32 certificateHash) external view returns (bool isRegistered, bool isHashMatched, bool isRevoked, uint256 registeredAt)',
    'function revokeCertificate(string certificateId, string reason) external',
    'function getCertificate(string certificateId) external view returns (string id, bytes32 certificateHash, address issuer, uint256 registeredAt, bool revoked, uint256 revokedAt, string revocationReason)',
    'function isCertificateRegistered(string certificateId) external view returns (bool)',
];
/**
 * Converts a 64-character SHA-256 hex string to bytes32 format (0x...)
 */
const fileHashToBytes32 = (hexHash) => {
    const cleanHex = hexHash.replace(/^0x/, '');
    if (cleanHex.length !== 64) {
        // If hash length differs, pad or hash to 32 bytes using keccak256
        return ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(hexHash));
    }
    return `0x${cleanHex}`;
};
exports.fileHashToBytes32 = fileHashToBytes32;
/**
 * Get authenticated ethers Contract instance
 */
const getContractInstance = () => {
    if (!config_1.config.contractAddress || !config_1.config.blockchainPrivateKey) {
        return null;
    }
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(config_1.config.sepoliaRpcUrl);
        const wallet = new ethers_1.ethers.Wallet(config_1.config.blockchainPrivateKey, provider);
        const contract = new ethers_1.ethers.Contract(config_1.config.contractAddress, CONTRACT_ABI, wallet);
        return { contract, wallet, provider };
    }
    catch (err) {
        console.error('Failed to initialize Ethers RPC connection:', err.message);
        return null;
    }
};
/**
 * Register certificate SHA-256 fingerprint on Ethereum Sepolia Smart Contract
 */
const registerCertificateOnChain = async (certificateId, fileHashHex) => {
    const instance = getContractInstance();
    if (!instance) {
        return {
            success: false,
            status: 'NOT_CONNECTED',
            error: 'Smart contract address or private key environment variables not configured.',
        };
    }
    try {
        const { contract } = instance;
        const bytes32Hash = (0, exports.fileHashToBytes32)(fileHashHex);
        // Call smart contract registerCertificate function
        const tx = await contract.registerCertificate(certificateId, bytes32Hash);
        const receipt = await tx.wait(1); // Wait 1 block confirmation
        return {
            success: true,
            status: 'CONFIRMED',
            txHash: receipt.hash,
            contractAddress: config_1.config.contractAddress,
            registeredAt: new Date(),
        };
    }
    catch (err) {
        console.error(`Blockchain registration failed for ${certificateId}:`, err.message || err);
        return {
            success: false,
            status: 'FAILED',
            error: err.reason || err.message || 'Smart contract transaction reverted.',
        };
    }
};
exports.registerCertificateOnChain = registerCertificateOnChain;
/**
 * Revoke certificate on Ethereum Sepolia Smart Contract
 */
const revokeCertificateOnChain = async (certificateId, reason) => {
    const instance = getContractInstance();
    if (!instance) {
        return {
            success: false,
            status: 'FAILED',
            error: 'Smart contract address or private key environment variables not configured.',
        };
    }
    try {
        const { contract } = instance;
        const tx = await contract.revokeCertificate(certificateId, reason);
        const receipt = await tx.wait(1);
        return {
            success: true,
            status: 'REVOKED',
            txHash: receipt.hash,
        };
    }
    catch (err) {
        console.error(`Blockchain revocation failed for ${certificateId}:`, err.message || err);
        return {
            success: false,
            status: 'FAILED',
            error: err.reason || err.message || 'Smart contract revocation transaction reverted.',
        };
    }
};
exports.revokeCertificateOnChain = revokeCertificateOnChain;
/**
 * Verify certificate registration metadata against smart contract on-chain state
 */
const verifyCertificateOnChain = async (certificateId, fileHashHex) => {
    const instance = getContractInstance();
    if (!instance) {
        return {
            success: false,
            isRegistered: false,
            isHashMatched: false,
            isRevoked: false,
            network: config_1.config.blockchainNetwork,
            contractAddress: config_1.config.contractAddress || undefined,
        };
    }
    try {
        const { contract } = instance;
        const bytes32Hash = (0, exports.fileHashToBytes32)(fileHashHex);
        const isReg = await contract.isCertificateRegistered(certificateId);
        if (!isReg) {
            return {
                success: true,
                isRegistered: false,
                isHashMatched: false,
                isRevoked: false,
                network: config_1.config.blockchainNetwork,
                contractAddress: config_1.config.contractAddress,
            };
        }
        const [id, onChainHash, issuer, registeredAt, revoked, revokedAt, revocationReason] = await contract.getCertificate(certificateId);
        const isHashMatched = onChainHash.toLowerCase() === bytes32Hash.toLowerCase();
        const registeredAtDate = new Date(Number(registeredAt) * 1000);
        return {
            success: true,
            isRegistered: true,
            isHashMatched,
            isRevoked: revoked,
            issuer,
            registeredAt: registeredAtDate,
            onChainHash,
            network: config_1.config.blockchainNetwork,
            contractAddress: config_1.config.contractAddress,
        };
    }
    catch (err) {
        console.error(`Blockchain verify failed for ${certificateId}:`, err.message || err);
        return {
            success: false,
            isRegistered: false,
            isHashMatched: false,
            isRevoked: false,
            network: config_1.config.blockchainNetwork,
            contractAddress: config_1.config.contractAddress,
        };
    }
};
exports.verifyCertificateOnChain = verifyCertificateOnChain;
