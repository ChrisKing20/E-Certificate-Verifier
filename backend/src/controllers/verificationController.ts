import { Request, Response, NextFunction } from 'express';
import {
  verifyByCertificateNumber,
  verifyByPdfHash,
  getVerificationLogs,
} from '../services/verificationService';
import fs from 'fs';
import { validatePdfMagicBytes } from '../middleware/uploadMiddleware';

export const handleVerifyByNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const certificateId = req.params.certificateId as string;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await verifyByCertificateNumber(certificateId, ipAddress, userAgent);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleVerifyByPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        status: 'INVALID',
        message: 'PDF document file is required for verification.',
      });
      return;
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const fileBuffer = fs.readFileSync(req.file.path);

    if (!validatePdfMagicBytes(fileBuffer)) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        success: false,
        status: 'INVALID',
        message: 'Invalid file signature. Uploaded file is not a valid PDF document.',
      });
      return;
    }

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const result = await verifyByPdfHash(fileBuffer, ipAddress, userAgent);

    res.status(200).json(result);
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const handleGetVerificationLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit } = req.query;

    const result = await getVerificationLogs({
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    res.status(200).json({
      success: true,
      logs: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
