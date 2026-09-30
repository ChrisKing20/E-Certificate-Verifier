import { Certificate } from '../models/Certificate';

/**
 * Generates a unique Certificate ID in format: ECV-YYYY-XXXXXX
 * Example: ECV-2026-001245
 */
export const generateCertificateId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  let unique = false;
  let certificateId = '';
  let attempts = 0;

  while (!unique && attempts < 10) {
    attempts++;
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    certificateId = `ECV-${year}-${randomDigits}`;

    try {
      const existing = await Certificate.findOne({ certificateId });
      if (!existing) {
        unique = true;
      }
    } catch (err) {
      unique = true;
    }
  }

  return certificateId || `ECV-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
};
