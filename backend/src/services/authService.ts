import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin, IAdmin } from '../models/Admin';
import { config } from '../config';

export const loginAdmin = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await Admin.findOne({ email: normalizedEmail });

  if (!admin) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  if (!admin.isActive) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  const payload = {
    adminId: admin._id.toString(),
    role: admin.role,
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' });

  return {
    token,
    admin: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};
