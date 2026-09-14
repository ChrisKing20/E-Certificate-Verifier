import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest } from '../types';
import { Admin } from '../models/Admin';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Authorization token is missing.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { adminId?: string; id?: string; role: string };
    const adminId = decoded.adminId || decoded.id;

    if (!adminId) {
      res.status(401).json({ success: false, message: 'Invalid token payload.' });
      return;
    }

    const admin = await Admin.findById(adminId);

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Administrator account is inactive or no longer exists.',
      });
      return;
    }

    req.admin = {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired authentication token.',
    });
    return;
  }
};
