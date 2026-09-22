import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/dashboardService';
import { retryBlockchainRegistration, migrateLocalCertificatesToIPFS } from '../services/certificateService';
import { AuthRequest } from '../types';

export const handleGetDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user || authReq.admin;
    const stats = await getDashboardStats({
      institutionId: user?.institutionId || null,
      role: user?.role,
    });

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRetryBlockchainRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await retryBlockchainRegistration(id);

    res.status(200).json({
      success: true,
      message: 'Blockchain registration retry completed.',
      certificate: result.certificate,
      blockchainResult: result.blockchainResult,
    });
  } catch (error) {
    next(error);
  }
};

export const handleMigrateIpfs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await migrateLocalCertificatesToIPFS();
    res.status(200).json({
      success: true,
      message: 'Local certificate migration to IPFS completed successfully.',
      result,
    });
  } catch (error) {
    next(error);
  }
};

