import { Request, Response, NextFunction } from 'express';
import {
  registerInstitution,
  getInstitutions,
  approveInstitution,
  rejectInstitution,
  suspendInstitution,
} from '../services/institutionService';

export const handleRegisterInstitution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      institutionName,
      institutionCode,
      officialEmail,
      phone,
      website,
      description,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    if (!institutionName || !institutionCode || !officialEmail || !adminName || !adminEmail) {
      res.status(400).json({
        success: false,
        message: 'Institution name, institution code, official email, admin name, and admin email are required.',
      });
      return;
    }

    const result = await registerInstitution({
      institutionName,
      institutionCode,
      officialEmail,
      phone,
      website,
      description,
      adminName,
      adminEmail,
      adminPassword,
    });

    res.status(201).json({
      success: true,
      message: 'Institution onboarding request submitted successfully. Status is PENDING platform approval.',
      institution: result.institution,
      adminUser: result.adminUser,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetInstitutions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search } = req.query;
    const institutions = await getInstitutions({
      status: status as string,
      search: search as string,
    });

    res.status(200).json({
      success: true,
      institutions,
    });
  } catch (error) {
    next(error);
  }
};

export const handleApproveInstitution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const institution = await approveInstitution(id);

    res.status(200).json({
      success: true,
      message: 'Institution approved successfully. Admin account is now ACTIVE.',
      institution,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRejectInstitution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const institution = await rejectInstitution(id);

    res.status(200).json({
      success: true,
      message: 'Institution request rejected.',
      institution,
    });
  } catch (error) {
    next(error);
  }
};

export const handleSuspendInstitution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const institution = await suspendInstitution(id);

    res.status(200).json({
      success: true,
      message: 'Institution suspended successfully.',
      institution,
    });
  } catch (error) {
    next(error);
  }
};
