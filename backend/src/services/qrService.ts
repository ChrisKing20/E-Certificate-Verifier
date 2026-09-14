import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

/**
 * Generates a QR Code for certificate verification URL
 * Example URL: http://localhost:5173/verify?certificate=ECV-2026-001245
 */
export const generateQRCode = async (certificateId: string): Promise<{ qrDataUrl: string; qrFilePath?: string }> => {
  const verificationUrl = `${config.corsOrigin}/verify?certificate=${encodeURIComponent(certificateId)}`;
  
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
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
    await QRCode.toFile(qrFilePath, verificationUrl);
  } catch (_e) {}

  return {
    qrDataUrl,
    qrFilePath: `uploads/${qrFileName}`,
  };
};
