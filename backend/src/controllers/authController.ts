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

export const handleGoogleRedirect = (req: Request, res: Response): void => {
  const intendedPortal = (req.query.intendedPortal || req.query.portal || 'USER') as string;
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId) {
    res.status(500).json({ success: false, message: 'Google Client ID is not configured on backend.' });
    return;
  }

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&state=${encodeURIComponent(intendedPortal)}` +
    `&prompt=consent`;

  res.redirect(googleAuthUrl);
};

export const handleGoogleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { code, state } = req.query;
    const intendedPortal = (state as 'ADMIN' | 'USER') || 'USER';

    if (!code) {
      res.redirect(`${frontendUrl}/${intendedPortal === 'ADMIN' ? 'admin/' : ''}login?error=${encodeURIComponent('No authorization code provided by Google.')}`);
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    // Exchange code for Google OAuth tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenResponse.json()) as any;

    if (!tokenResponse.ok || !tokenData.access_token) {
      const errorMsg = tokenData.error_description || 'Failed to exchange authorization code with Google.';
      res.redirect(`${frontendUrl}/${intendedPortal === 'ADMIN' ? 'admin/' : ''}login?error=${encodeURIComponent(errorMsg)}`);
      return;
    }

    // Fetch Google user profile
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await userinfoResponse.json()) as any;

    if (!profile.id || !profile.email) {
      res.redirect(`${frontendUrl}/${intendedPortal === 'ADMIN' ? 'admin/' : ''}login?error=${encodeURIComponent('Failed to retrieve user profile from Google.')}`);
      return;
    }

    const result = await handleGoogleAuthService({
      googleId: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      profileImage: profile.picture || null,
      intendedPortal,
    });

    const userEncoded = encodeURIComponent(JSON.stringify(result.user));
    const tokenEncoded = encodeURIComponent(result.token);

    res.redirect(`${frontendUrl}/auth/callback?token=${tokenEncoded}&user=${userEncoded}`);
  } catch (error: any) {
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message || 'Google OAuth authentication failed.')}`);
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
