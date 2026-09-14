import { Certificate } from '../models/Certificate';
import { VerificationLog } from '../models/VerificationLog';

export const getDashboardStats = async () => {
  try {
    const [
      totalCertificates,
      validCertificates,
      revokedCertificates,
      totalVerifications,
      invalidAttempts,
    ] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ status: 'VALID' }),
      Certificate.countDocuments({ status: 'REVOKED' }),
      VerificationLog.countDocuments(),
      VerificationLog.countDocuments({
        result: { $in: ['INVALID', 'NOT_FOUND', 'HASH_MISMATCH'] },
      }),
    ]);

    return {
      totalCertificates,
      validCertificates,
      revokedCertificates,
      totalVerifications,
      invalidAttempts,
    };
  } catch (err) {
    return {
      totalCertificates: 0,
      validCertificates: 0,
      revokedCertificates: 0,
      totalVerifications: 0,
      invalidAttempts: 0,
    };
  }
};
