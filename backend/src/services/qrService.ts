import QRCode from 'qrcode';
import { config } from '../config';
import { uploadCertificateToIPFS } from './ipfsService';

/**
 * Generates a QR Code for certificate verification URL and pins it to IPFS.
 *
 * The QR PNG is generated entirely in memory and uploaded directly to Pinata IPFS.
 * It is NEVER written to local disk — no file is created in uploads/ or anywhere else.
 * The qrDataUrl (base64 data URL) is returned for immediate frontend preview use only.
 */
export const generateQRCode = async (
  certificateId: string
): Promise<{
  qrDataUrl: string;
  qrFilePath: string | null;
  ipfsQrCid?: string | null;
  ipfsQrGatewayUrl?: string | null;
}> => {
  const verificationUrl = `${config.corsOrigin}/verify?certificate=${encodeURIComponent(certificateId)}`;

  // Generate QR as base64 data URL (for frontend display only — never stored)
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#0B132B',
      light: '#FFFFFF',
    },
  });

  // Generate QR as raw PNG buffer (in memory only)
  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#0B132B',
      light: '#FFFFFF',
    },
  });

  // Upload buffer directly to Pinata IPFS — no local file write
  const qrFileName = `qr_${certificateId.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  let ipfsQrCid: string | null = null;
  let ipfsQrGatewayUrl: string | null = null;

  try {
    const ipfsRes = await uploadCertificateToIPFS(qrBuffer, qrFileName);
    if (ipfsRes.cid) {
      ipfsQrCid = ipfsRes.cid;
      ipfsQrGatewayUrl = ipfsRes.gatewayUrl;
    }
  } catch (_err) {}

  return {
    qrDataUrl,
    qrFilePath: null, // No local file — QR lives only on Pinata IPFS
    ipfsQrCid,
    ipfsQrGatewayUrl,
  };
};
