// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateRegistry
 * @dev Smart Contract for registering and verifying SHA-256 certificate hashes on Ethereum (Sepolia Testnet).
 * Stores only certificate verification metadata (certificateId, SHA-256 bytes32 hash, issuer, timestamps, revocation status).
 * No personal details or PDF files are stored on-chain.
 */
contract CertificateRegistry is Ownable {

    struct CertificateRecord {
        string certificateId;
        bytes32 certificateHash;
        address issuer;
        uint256 registeredAt;
        bool revoked;
        uint256 revokedAt;
        string revocationReason;
    }

    // Mapping: Certificate ID -> CertificateRecord
    mapping(string => CertificateRecord) private _certificatesById;

    // Mapping: Certificate Hash (bytes32) -> Certificate ID (to prevent hash duplication)
    mapping(bytes32 => string) private _certificateIdByHash;

    // Array of registered Certificate IDs
    string[] private _allCertificateIds;

    // Events
    event CertificateRegistered(
        string indexed certificateId,
        bytes32 indexed certificateHash,
        address indexed issuer,
        uint256 registeredAt
    );

    event CertificateRevoked(
        string indexed certificateId,
        bytes32 indexed certificateHash,
        string reason,
        uint256 revokedAt
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new certificate on-chain
     * @param certificateId Unique certificate identifier (e.g. ECV-2026-001245)
     * @param certificateHash Canonical SHA-256 hash formatted as bytes32
     */
    function registerCertificate(
        string calldata certificateId,
        bytes32 certificateHash
    ) external onlyOwner {
        require(bytes(certificateId).length > 0, "Certificate ID cannot be empty");
        require(certificateHash != bytes32(0), "Certificate hash cannot be empty");
        
        // Revert if Certificate ID is already registered
        require(_certificatesById[certificateId].registeredAt == 0, "Certificate ID already registered");

        // Revert if Certificate Hash already belongs to another registered certificate
        require(bytes(_certificateIdByHash[certificateHash]).length == 0, "Certificate hash already registered to another certificate");

        CertificateRecord memory record = CertificateRecord({
            certificateId: certificateId,
            certificateHash: certificateHash,
            issuer: msg.sender,
            registeredAt: block.timestamp,
            revoked: false,
            revokedAt: 0,
            revocationReason: ""
        });

        _certificatesById[certificateId] = record;
        _certificateIdByHash[certificateHash] = certificateId;
        _allCertificateIds.push(certificateId);

        emit CertificateRegistered(certificateId, certificateHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify a certificate ID against its expected SHA-256 hash
     * @param certificateId Unique certificate identifier
     * @param certificateHash Canonical SHA-256 hash formatted as bytes32
     */
    function verifyCertificate(
        string calldata certificateId,
        bytes32 certificateHash
    ) external view returns (bool isValid, bool isRevoked) {
        CertificateRecord memory record = _certificatesById[certificateId];
        if (record.registeredAt == 0) {
            return (false, false);
        }

        bool hashMatches = (record.certificateHash == certificateHash);
        isValid = hashMatches && !record.revoked;
        isRevoked = record.revoked;
    }

    /**
     * @notice Revoke a registered certificate on-chain
     * @param certificateId Unique certificate identifier
     * @param reason Official revocation reason
     */
    function revokeCertificate(
        string calldata certificateId,
        string calldata reason
    ) external onlyOwner {
        CertificateRecord storage record = _certificatesById[certificateId];
        require(record.registeredAt > 0, "Certificate ID not found");
        require(!record.revoked, "Certificate is already revoked");

        record.revoked = true;
        record.revokedAt = block.timestamp;
        record.revocationReason = reason;

        emit CertificateRevoked(certificateId, record.certificateHash, reason, block.timestamp);
    }

    /**
     * @notice Check if a certificate ID is registered on-chain
     */
    function isCertificateRegistered(string calldata certificateId) external view returns (bool) {
        return _certificatesById[certificateId].registeredAt > 0;
    }

    /**
     * @notice Retrieve on-chain certificate record details
     */
    function getCertificate(string calldata certificateId)
        external
        view
        returns (
            string memory id,
            bytes32 certificateHash,
            address issuer,
            uint256 registeredAt,
            bool revoked,
            uint256 revokedAt,
            string memory revocationReason
        )
    {
        CertificateRecord memory record = _certificatesById[certificateId];
        require(record.registeredAt > 0, "Certificate record not found on-chain");

        return (
            record.certificateId,
            record.certificateHash,
            record.issuer,
            record.registeredAt,
            record.revoked,
            record.revokedAt,
            record.revocationReason
        );
    }

    /**
     * @notice Returns total number of certificates registered on-chain
     */
    function getCertificateCount() external view returns (uint256) {
        return _allCertificateIds.length;
    }
}
