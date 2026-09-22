import { Request, Response, NextFunction } from 'express';
import {
  createCertificate,
  getCertificates,
  getCertificateById,
  revokeCertificate,
  updateCertificateBlockchainMetadata,
} from '../services/certificateService';
import { AuthRequest } from '../types';
import fs from 'fs';

export const handleCreateCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { recipientName, recipientEmail, eventName, eventDate, department, certificateType } = req.body;
    const user = authReq.user || authReq.admin;

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
      institutionId: user?.institutionId || null,
      issuedBy: user?.id || null,
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
    const authReq = req as AuthRequest;
    const { search, status, page, limit } = req.query;
    const user = authReq.user || authReq.admin;

    // Enforce multi-tenant data isolation for ADMIN role
    const scopedInstitutionId = user?.role === 'ADMIN' ? user.institutionId : undefined;

    const result = await getCertificates({
      search: search as string,
      status: status as string,
      institutionId: scopedInstitutionId,
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
    const authReq = req as AuthRequest;
    const id = req.params.id as string;
    const user = authReq.user || authReq.admin;

    const certificate = await getCertificateById(id);

    // Strict multi-tenant isolation check
    if (user?.role === 'ADMIN' && certificate.institutionId) {
      if (certificate.institutionId.toString() !== user.institutionId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have permission to view another institution\'s certificate.',
        });
        return;
      }
    }

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
    const authReq = req as AuthRequest;
    const id = req.params.id as string;
    const { reason } = req.body;
    const user = authReq.user || authReq.admin;

    if (!reason || !reason.trim()) {
      res.status(400).json({
        success: false,
        message: 'Revocation reason is required.',
      });
      return;
    }

    const cert = await getCertificateById(id);
    if (user?.role === 'ADMIN' && cert.institutionId) {
      if (cert.institutionId.toString() !== user.institutionId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Forbidden. You cannot revoke a certificate belonging to another institution.',
        });
        return;
      }
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
    const authReq = req as AuthRequest;
    const id = req.params.id as string;
    const user = authReq.user || authReq.admin;
    const {
      transactionHash,
      blockNumber,
      network,
      contractAddress,
      blockchainHash,
      issuerAddress,
      status,
    } = req.body;

    const cert = await getCertificateById(id);
    if (user?.role === 'ADMIN' && cert.institutionId) {
      if (cert.institutionId.toString() !== user.institutionId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Forbidden. You cannot update blockchain metadata for another institution\'s certificate.',
        });
        return;
      }
    }

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

