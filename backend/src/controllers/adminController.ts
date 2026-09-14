import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/dashboardService';
import { retryBlockchainRegistration } from '../services/certificateService';

export const handleGetDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await getDashboardStats();

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
