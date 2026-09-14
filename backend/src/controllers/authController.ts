import { Request, Response, NextFunction } from 'express';
import { loginAdmin } from '../services/authService';

export const handleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const result = await loginAdmin(email, password);

    res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token: result.token,
      admin: result.admin,
    });
  } catch (error) {
    next(error);
  }
};
