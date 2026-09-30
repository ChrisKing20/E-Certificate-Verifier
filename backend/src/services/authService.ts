import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { Admin } from '../models/Admin';
import { Institution } from '../models/Institution';
import { config } from '../config';

export interface RegisterUserDto {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  profileImage?: string;
}

export const registerUser = async (data: RegisterUserDto) => {
  const normalizedEmail = data.email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw { statusCode: 409, message: 'An account with this email address already exists.' };
  }

  let passwordHash = null;
  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 10);
  }

  const user = await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash,
    googleId: data.googleId || undefined,
    role: 'USER',
    emailVerified: false,
    authProvider: data.googleId ? 'GOOGLE' : 'LOCAL',
    status: 'ACTIVE',
    profileImage: data.profileImage || null,
  });

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      adminId: user._id.toString(),
      id: user._id.toString(),
      role: user.role,
      institutionId: null,
    },
    config.jwtSecret,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: null,
      status: user.status,
    },
  };
};

export const loginUserOrAdmin = async (email: string, password: string, requiredRole?: UserRole) => {
  const normalizedEmail = email.trim().toLowerCase();

  let user: any = await User.findOne({ email: normalizedEmail });

  // Fallback to legacy Admin model if User collection record not created yet
  if (!user) {
    const legacyAdmin = await Admin.findOne({ email: normalizedEmail });
    if (legacyAdmin) {
      const isPassValid = await bcrypt.compare(password, legacyAdmin.passwordHash);
      if (!isPassValid) {
        throw { statusCode: 401, message: 'Invalid email or password.' };
      }
      if (!legacyAdmin.isActive) {
        throw { statusCode: 401, message: 'Invalid email or password.' };
      }
      const token = jwt.sign(
        {
          userId: legacyAdmin._id.toString(),
          adminId: legacyAdmin._id.toString(),
          id: legacyAdmin._id.toString(),
          role: legacyAdmin.role,
        },
        config.jwtSecret,
        { expiresIn: '8h' }
      );
      return {
        token,
        user: {
          id: legacyAdmin._id.toString(),
          name: legacyAdmin.name,
          email: legacyAdmin.email,
          role: legacyAdmin.role,
          institutionId: null,
        },
        admin: {
          id: legacyAdmin._id.toString(),
          name: legacyAdmin.name,
          email: legacyAdmin.email,
          role: legacyAdmin.role,
        },
      };
    }
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  if (user.status !== 'ACTIVE') {
    if (user.status === 'PENDING') {
      throw {
        statusCode: 403,
        message: 'Account is pending approval. Please wait for institutional approval by platform administrator.',
      };
    }
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  if (!user.passwordHash) {
    throw {
      statusCode: 400,
      message: 'This account was created via Google Login. Please click "Continue with Google".',
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  if (requiredRole && requiredRole === 'ADMIN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw { statusCode: 403, message: 'Forbidden. User account does not have administrator privileges.' };
  }

  // Check institution status if user is an ADMIN
  let institution = null;
  if (user.role === 'ADMIN' && user.institutionId) {
    institution = await Institution.findById(user.institutionId);
    if (!institution || institution.status !== 'ACTIVE') {
      throw {
        statusCode: 403,
        message: `Institution '${institution?.name || 'Unknown'}' account is currently ${
          institution?.status || 'PENDING'
        }. Dashboard access disabled.`,
      };
    }
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      adminId: user._id.toString(),
      id: user._id.toString(),
      role: user.role,
      institutionId: user.institutionId ? user.institutionId.toString() : null,
    },
    config.jwtSecret,
    { expiresIn: '8h' }
  );

  const userPayload = {
    id: user._id.toString(),
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId ? user.institutionId.toString() : null,
    institutionName: institution ? institution.name : null,
  };

  return {
    token,
    user: userPayload,
    admin: userPayload,
  };
};

export const handleGoogleAuthService = async (data: {
  googleId: string;
  email: string;
  name: string;
  profileImage?: string;
  intendedPortal?: 'ADMIN' | 'USER';
}) => {
  const normalizedEmail = data.email.trim().toLowerCase();

  let user = await User.findOne({
    $or: [{ googleId: data.googleId }, { email: normalizedEmail }],
  });

  if (data.intendedPortal === 'ADMIN') {
    if (!user) {
      throw {
        statusCode: 403,
        message: 'Your Google account is not associated with an approved institution administrator account.',
      };
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw {
        statusCode: 403,
        message: 'Your Google account is not associated with an approved institution administrator account.',
      };
    }

    if (user.status !== 'ACTIVE') {
      throw {
        statusCode: 403,
        message: 'Administrator account is pending approval or suspended.',
      };
    }

    if (user.role === 'ADMIN' && user.institutionId) {
      const inst = await Institution.findById(user.institutionId);
      if (!inst || inst.status !== 'ACTIVE') {
        throw {
          statusCode: 403,
          message: `Institution '${inst?.name || 'Unknown'}' is not active.`,
        };
      }
    }
  }

  if (!user) {
    user = await User.create({
      name: data.name.trim(),
      email: normalizedEmail,
      googleId: data.googleId,
      role: 'USER',
      authProvider: 'GOOGLE',
      status: 'ACTIVE',
      profileImage: data.profileImage || null,
      emailVerified: true,
    });
  } else {
    if (!user.googleId) {
      user.googleId = data.googleId;
      user.authProvider = user.passwordHash ? 'LOCAL_AND_GOOGLE' : 'GOOGLE';
      await user.save();
    }
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      adminId: user._id.toString(),
      id: user._id.toString(),
      role: user.role,
      institutionId: user.institutionId ? user.institutionId.toString() : null,
    },
    config.jwtSecret,
    { expiresIn: '8h' }
  );

  let institutionName: string | null = null;
  if (user.institutionId) {
    const inst = await Institution.findById(user.institutionId);
    institutionName = inst ? inst.name : null;
  }

  const userPayload = {
    id: user._id.toString(),
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId ? user.institutionId.toString() : null,
    institutionName,
  };

  return {
    token,
    user: userPayload,
    admin: userPayload,
  };
};

// Backward-compatible alias for existing tests calling loginAdmin
export const loginAdmin = async (email: string, password: string) => {
  return loginUserOrAdmin(email, password, 'ADMIN');
};
