import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

import { uploadCertificateToIPFS } from './ipfsService';

/**
 * Generates a QR Code for certificate verification URL and pins it to IPFS
 * Example URL: http://localhost:5173/verify?certificate=ECV-2026-001245
 */
export const generateQRCode = async (
  certificateId: string
): Promise<{
  qrDataUrl: string;
  qrFilePath?: string;
  ipfsQrCid?: string | null;
  ipfsQrGatewayUrl?: string | null;
}> => {
  const verificationUrl = `${config.corsOrigin}/verify?certificate=${encodeURIComponent(certificateId)}`;
  
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#0B132B',
      light: '#FFFFFF',
    },
  });

  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#0B132B',
      light: '#FFFFFF',
    },
  });

  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }

  const qrFileName = `qr_${certificateId.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  const qrFilePath = path.join(config.uploadDir, qrFileName);
  
  try {
    await fs.promises.writeFile(qrFilePath, qrBuffer);
  } catch (_e) {}

  let ipfsQrCid: string | null = null;
  let ipfsQrGatewayUrl: string | null = null;

  try {
    const ipfsRes = await uploadCertificateToIPFS(qrBuffer, `${qrFileName}`);
    if (ipfsRes.cid) {
      ipfsQrCid = ipfsRes.cid;
      ipfsQrGatewayUrl = ipfsRes.gatewayUrl;
    }
  } catch (_err) {}

  return {
    qrDataUrl,
    qrFilePath: `uploads/${qrFileName}`,
    ipfsQrCid,
    ipfsQrGatewayUrl,
  };
};
