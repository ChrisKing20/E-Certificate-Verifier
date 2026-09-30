import { connectDB } from '../config/db';
import { reuploadCertificatePdf } from '../services/certificateService';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const run = async () => {
  const args = process.argv.slice(2);
  const certId = args[0] || 'ECV-2026-387230';
  const targetFilePath = args[1];

  console.log(`🔄 Re-uploading PDF for Certificate ${certId}...`);

  try {
    await connectDB();

    let pdfBuffer: Buffer | null = null;
    let relativePath = `uploads/${certId}.pdf`;

    if (targetFilePath && fs.existsSync(targetFilePath)) {
      pdfBuffer = await fs.promises.readFile(targetFilePath);
    } else {
      // Look in uploads directory for any PDF file
      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir).filter((f) => f.endsWith('.pdf'));
        if (files.length > 0) {
          const matchedFile = files[0];
          pdfBuffer = await fs.promises.readFile(path.join(uploadsDir, matchedFile));
          relativePath = `uploads/${matchedFile}`;
          console.log(`📄 Using local PDF file: ${matchedFile}`);
        }
      }
    }

    if (!pdfBuffer) {
      console.error('❌ No PDF file provided or found in uploads directory.');
      console.log('Usage: npx ts-node src/scripts/reuploadCertPdf.ts <CERTIFICATE_ID> <PATH_TO_PDF>');
      process.exit(1);
    }

    const updatedCert = await reuploadCertificatePdf(certId, pdfBuffer, relativePath);

    console.log('✅ Certificate PDF re-uploaded & pinned to Pinata IPFS successfully!');
    console.log(`Certificate ID: ${updatedCert.certificateId}`);
    console.log(`Pinata PDF CID: ${updatedCert.ipfsCid}`);
    console.log(`Pinata PDF Gateway: ${updatedCert.ipfsGatewayUrl}`);
    console.log(`Pinata QR CID: ${updatedCert.ipfsQrCid}`);
    console.log(`Pinata QR Gateway: ${updatedCert.ipfsQrGatewayUrl}`);
  } catch (err: any) {
    console.error('❌ Error re-uploading certificate PDF:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
