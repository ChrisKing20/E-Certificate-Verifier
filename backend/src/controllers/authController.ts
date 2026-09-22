import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUserOrAdmin,
  handleGoogleAuthService,
} from '../services/authService';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { Institution } from '../models/Institution';

export const handleRegisterUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const result = await registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const handleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const result = await loginUserOrAdmin(email, password, role);

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token: result.token,
      user: result.user,
      admin: result.admin,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { googleId, email, name, profileImage, intendedPortal } = req.body;

    if (!googleId || !email || !name) {
      res.status(400).json({
        success: false,
        message: 'Google ID, email, and name are required for Google authentication.',
      });
      return;
    }

    const result = await handleGoogleAuthService({
      googleId,
      email,
      name,
      profileImage,
      intendedPortal,
    });

    res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      token: result.token,
      user: result.user,
      admin: result.admin,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const activeUser = authReq.user || authReq.admin;
    if (!activeUser) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const user = await User.findById(activeUser.id).select('-passwordHash');
    let institution = null;

    if (user?.institutionId) {
      institution = await Institution.findById(user.institutionId);
    }

    res.status(200).json({
      success: true,
      user: {
        id: activeUser.id,
        name: user ? user.name : activeUser.name,
        email: user ? user.email : activeUser.email,
        role: user ? user.role : activeUser.role,
        institutionId: user ? user.institutionId : activeUser.institutionId,
        institutionName: institution ? institution.name : null,
        institutionCode: institution ? institution.institutionCode : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
