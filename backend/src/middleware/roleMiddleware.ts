import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const requireRole = (requiredRole: 'ADMIN' | 'SUPER_ADMIN') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const { role } = req.admin;

    // SUPER_ADMIN can access both SUPER_ADMIN and ADMIN routes
    if (role === 'SUPER_ADMIN') {
      next();
      return;
    }

    // ADMIN can access ADMIN routes, but NOT SUPER_ADMIN routes
    if (requiredRole === 'ADMIN' && role === 'ADMIN') {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Forbidden. Insufficient administrative privileges.',
    });
  };
};
