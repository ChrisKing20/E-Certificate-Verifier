import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || process.env.INFURA_API_KEY || '';
const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET || process.env.INFURA_SECRET_KEY || '';
const PINATA_JWT = process.env.IPFS_JWT || process.env.PINATA_JWT || '';
const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY || '';

export interface IpfsUploadResult {
  cid: string;
  gatewayUrl: string;
  pinned: boolean;
}

const formatGatewayUrl = (cid: string): string => {
  const baseGateway = process.env.IPFS_GATEWAY_URL || 'https://dweb.link/ipfs/';
  const cleanBase = baseGateway.endsWith('/') ? baseGateway : `${baseGateway}/`;
  return `${cleanBase}${cid}`;
};

/**
 * Encode buffer into RFC 4648 base32 string (lowercase, no padding)
 */
const encodeBase32 = (buffer: Buffer): string => {
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
};

/**
 * Generate a deterministic v1 IPFS-style CID string from file buffer (for offline/fallback mode).
 * Encodes CIDv1 binary header (0x01 version, 0x55 raw codec, 0x12 sha2-256, 0x20 digest length) + SHA256 digest
 * into valid RFC 4648 Base32 format starting with 'bafkrei' prefix.
 */
const generateFallbackCid = (fileBuffer: Buffer): string => {
  const digestBuffer = crypto.createHash('sha256').update(fileBuffer).digest();
  const cidHeader = Buffer.from([0x01, 0x55, 0x12, 0x20]);
  const fullBytes = Buffer.concat([cidHeader, digestBuffer]);
  return `b${encodeBase32(fullBytes)}`;
};

/**
 * Upload Certificate PDF to IPFS via Infura, Pinata, or standard IPFS HTTP gateway
 */
export const uploadCertificateToIPFS = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<IpfsUploadResult> => {
  const sanitizedFileName = path.basename(fileName).replace(/[^a-zA-Z0-9_.-]/g, '_');

  // Helper to attempt Pinata upload with given auth headers
  const tryPinataUpload = async (headers: Record<string, string>): Promise<string | null> => {
    const BlobClass = typeof globalThis.Blob !== 'undefined' ? globalThis.Blob : require('buffer').Blob;
    const fileBlob = new BlobClass([fileBuffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', fileBlob, sanitizedFileName);

    const metadata = JSON.stringify({
      name: `Certificate-${sanitizedFileName}`,
      keyvalues: {
        project: 'E-Certificate-Verifier',
        timestamp: new Date().toISOString(),
      },
    });
    formData.append('pinataMetadata', metadata);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData as any,
    });

    if (response.ok) {
      const data = (await response.json()) as { IpfsHash: string };
      return data.IpfsHash;
    } else {
      const errText = await response.text().catch(() => '');
      console.warn(`[IPFS Upload Notice] Pinata API returned status ${response.status}: ${errText}`);
      return null;
    }
  };

  // 1. Attempt upload with Pinata JWT if available
  if (PINATA_JWT) {
    try {
      const cid = await tryPinataUpload({ Authorization: `Bearer ${PINATA_JWT.trim()}` });
      if (cid) {
        return {
          cid,
          gatewayUrl: formatGatewayUrl(cid),
          pinned: true,
        };
      }
    } catch (err: any) {
      console.warn(`[IPFS Upload Notice] Pinata JWT upload failed: ${err.message}`);
    }
  }

  // 2. Attempt upload with Pinata API Key & Secret if available
  if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    try {
      const cid = await tryPinataUpload({
        pinata_api_key: PINATA_API_KEY.trim(),
        pinata_secret_api_key: PINATA_SECRET_KEY.trim(),
      });
      if (cid) {
        return {
          cid,
          gatewayUrl: formatGatewayUrl(cid),
          pinned: true,
        };
      }
    } catch (err: any) {
      console.warn(`[IPFS Upload Notice] Pinata API Key upload failed: ${err.message}`);
    }
  }

  // 3. Fallback to Infura IPFS API if credentials provided
  if (INFURA_PROJECT_ID && INFURA_PROJECT_SECRET) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${INFURA_PROJECT_ID}:${INFURA_PROJECT_SECRET}`).toString('base64');
      const BlobClass = typeof globalThis.Blob !== 'undefined' ? globalThis.Blob : require('buffer').Blob;
      const fileBlob = new BlobClass([fileBuffer], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', fileBlob, sanitizedFileName);

      const candidateEndpoints = [
        process.env.INFURA_IPFS_ENDPOINT,
        `https://ipfs.infura.io:5001/api/v0/add`,
        `https://${INFURA_PROJECT_ID}.ipfs.infura-ipfs.io:5001/api/v0/add`,
      ].filter(Boolean) as string[];

      for (const infuraEndpoint of candidateEndpoints) {
        try {
          const response = await fetch(infuraEndpoint, {
            method: 'POST',
            headers: {
              Authorization: authHeader,
            },
            body: formData as any,
          });

          if (response.ok) {
            const data = (await response.json()) as { Hash: string };
            const cid = data.Hash;
            return {
              cid,
              gatewayUrl: formatGatewayUrl(cid),
              pinned: true,
            };
          }
        } catch (_e) {}
      }
    } catch (_err) {}
  }

  // 3. Fallback: Generate valid deterministic IPFS CID representation
  const cid = generateFallbackCid(fileBuffer);
  const gatewayUrl = formatGatewayUrl(cid);

  return {
    cid,
    gatewayUrl,
    pinned: false,
  };
};

/**
 * Retrieve Certificate File Buffer from IPFS Gateway using multi-gateway fallback
 */
export const getCertificateFromIPFS = async (cid: string): Promise<Buffer> => {
  const customGateway = process.env.IPFS_GATEWAY_URL || 'https://ivory-tiny-mockingbird-918.mypinata.cloud/ipfs/';
  const baseGateway = customGateway.endsWith('/') ? customGateway : `${customGateway}/`;

  const gateways = [
    `${baseGateway}${cid}`,
    `https://dweb.link/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
  ];

  for (const gatewayUrl of gateways) {
    try {
      const response = await fetch(gatewayUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    } catch (_err) {
      // Continue to next gateway
    }
  }

  throw new Error(`Failed to retrieve certificate from IPFS gateway for CID ${cid}`);
};

/**
 * Pin Certificate CID to IPFS provider
 */
export const pinCertificate = async (cid: string): Promise<boolean> => {
  if (PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY)) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (PINATA_JWT) {
        headers['Authorization'] = `Bearer ${PINATA_JWT}`;
      } else {
        headers['pinata_api_key'] = PINATA_API_KEY;
        headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          hashToPin: cid,
          pinataMetadata: { name: `Pinned-${cid}` },
        }),
      });

      return response.ok;
    } catch (_err) {
      return false;
    }
  }
  return true;
};

/**
 * Safely remove temporary local file after successful upload to IPFS
 */
export const removeLocalTemporaryFile = async (filePath: string): Promise<void> => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err: any) {
    console.warn(`[Temporary File Cleanup Notice] Unable to delete file ${filePath}: ${err.message}`);
  }
};
