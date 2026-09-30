import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const requireRole = (...allowedRoles: Array<'SUPER_ADMIN' | 'ADMIN' | 'USER'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    const user = authReq.user || authReq.admin;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Authorization token is missing.',
      });
      return;
    }

    const role = user.role as 'SUPER_ADMIN' | 'ADMIN' | 'USER';

    // SUPER_ADMIN has platform-wide access
    if (role === 'SUPER_ADMIN') {
      next();
      return;
    }

    if (allowedRoles.includes(role)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Forbidden. Role '${role}' is not authorized to access this resource. Required role: ${allowedRoles.join(' or ')}.`,
    });
  };
};

export const requireInstitutionAccess = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    const user = authReq.user || authReq.admin;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    if (user.role === 'ADMIN' && !user.institutionId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. Admin account is not linked to any active institution.',
      });
      return;
    }

    next();
  };
};

