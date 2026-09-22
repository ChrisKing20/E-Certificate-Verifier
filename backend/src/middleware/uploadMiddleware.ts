import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

// Ensure uploads directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Strict Filename Sanitizer Function
export const sanitizeFilename = (rawName: string): string => {
  // Prevent path traversal attacks (.. / \ null bytes)
  const baseName = path.basename(rawName).replace(/[\0\r\n]/g, '');
  // Remove non-alphanumeric except dots, dashes, underscores
  return baseName.replace(/[^a-zA-Z0-9_.-]/g, '_');
};

// Validate PDF Magic Bytes Signature (%PDF- / 0x25 0x50 0x44 0x46 0x2D)
export const validatePdfMagicBytes = (buffer: Buffer): boolean => {
  if (!buffer || buffer.length < 5) return false;
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeOriginal = sanitizeFilename(file.originalname);
    const ext = path.extname(safeOriginal).toLowerCase() || '.pdf';
    cb(null, `cert-${uniqueSuffix}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const safeName = sanitizeFilename(file.originalname);
  const ext = path.extname(safeName).toLowerCase();
  const isPdfExtension = ext === '.pdf';
  const isPdfMime = file.mimetype === 'application/pdf';

  if (!isPdfExtension || !isPdfMime) {
    return cb(new Error('Invalid file type. Only PDF document files (.pdf) are allowed.'));
  }

  // Reject path traversal tokens explicitly
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Path traversal sequence detected in filename. Request rejected.'));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

