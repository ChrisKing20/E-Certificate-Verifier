import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest } from '../types';
import { User, IUser } from '../models/User';
import { Admin } from '../models/Admin';
import { Institution } from '../models/Institution';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
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
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId?: string;
      adminId?: string;
      id?: string;
      role?: string;
      institutionId?: string;
    };

    const targetId = decoded.userId || decoded.adminId || decoded.id;

    if (!targetId) {
      res.status(401).json({ success: false, message: 'Invalid token payload.' });
      return;
    }

    let user: any = await User.findById(targetId);

    // Fallback check against legacy Admin model if User not migrated yet
    if (!user) {
      const legacyAdmin = await Admin.findById(targetId);
      if (legacyAdmin) {
        user = {
          _id: legacyAdmin._id,
          name: legacyAdmin.name,
          email: legacyAdmin.email,
          role: legacyAdmin.role,
          status: legacyAdmin.isActive ? 'ACTIVE' : 'SUSPENDED',
          institutionId: null,
        };
      }
    }

    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Account is suspended, pending approval, or does not exist.',
      });
      return;
    }

    const role = user.role || decoded.role || 'USER';
    const institutionId = user.institutionId ? user.institutionId.toString() : decoded.institutionId || null;

    // For ADMIN role, check institution status
    if (role === 'ADMIN' && institutionId) {
      const inst = await Institution.findById(institutionId);
      if (!inst || inst.status !== 'ACTIVE') {
        res.status(401).json({
          success: false,
          message: 'Unauthorized. Institution account is pending approval, suspended, or rejected.',
        });
        return;
      }
    }

    const payload = {
      id: user._id.toString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role,
      institutionId,
    };

    authReq.user = payload;
    authReq.admin = payload;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired authentication token.',
    });
    return;
  }
};

