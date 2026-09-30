import { Certificate } from '../models/Certificate';
import { User } from '../models/User';

export const getUserCertificates = async (userEmail: string, userId: string) => {
  const normalizedEmail = userEmail.trim().toLowerCase();

  const certificates = await Certificate.find({
    $or: [{ recipientEmail: normalizedEmail }, { recipientUserId: userId }],
  }).sort({ createdAt: -1 });

  return certificates;
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw { statusCode: 404, message: 'User profile not found.' };
  }
  return user;
};
