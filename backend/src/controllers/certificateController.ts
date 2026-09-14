import { Request, Response, NextFunction } from 'express';
import {
  createCertificate,
  getCertificates,
  getCertificateById,
  revokeCertificate,
  updateCertificateBlockchainMetadata,
} from '../services/certificateService';
import fs from 'fs';

export const handleCreateCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recipientName, recipientEmail, eventName, eventDate, department, certificateType } = req.body;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Certificate PDF document file is required.',
      });
      return;
    }

    if (!recipientName || !recipientEmail || !eventName || !eventDate) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        success: false,
        message: 'Required fields missing: recipientName, recipientEmail, eventName, and eventDate are required.',
      });
      return;
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const relativePath = `uploads/${req.file.filename}`;

    const result = await createCertificate({
      recipientName,
      recipientEmail,
      eventName,
      eventDate,
      department,
      certificateType,
      fileBuffer,
      filePath: relativePath,
    });

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully.',
      certificate: result.certificate,
      qrDataUrl: result.qrDataUrl,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const handleGetCertificates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, status, page, limit } = req.query;

    const result = await getCertificates({
      search: search as string,
      status: status as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    });

    res.status(200).json({
      success: true,
      data: result.certificates,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetCertificateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const certificate = await getCertificateById(id);

    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRevokeCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      res.status(400).json({
        success: false,
        message: 'Revocation reason is required.',
      });
      return;
    }

    const result = await revokeCertificate(id, reason as string);

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully.',
      certificate: result.certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateBlockchainMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const {
      transactionHash,
      blockNumber,
      network,
      contractAddress,
      blockchainHash,
      issuerAddress,
      status,
    } = req.body;

    const certificate = await updateCertificateBlockchainMetadata(id, {
      transactionHash,
      blockNumber,
      network,
      contractAddress,
      blockchainHash,
      issuerAddress,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Blockchain metadata updated successfully.',
      certificate,
    });
  } catch (error) {
    next(error);
  }
};
