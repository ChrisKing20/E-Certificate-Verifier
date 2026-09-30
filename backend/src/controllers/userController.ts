import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getUserCertificates, getUserProfile } from '../services/userService';

export const handleGetUserCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user || authReq.admin;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const certificates = await getUserCertificates(user.email, user.id);

    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user || authReq.admin;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const profile = await getUserProfile(user.id);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

