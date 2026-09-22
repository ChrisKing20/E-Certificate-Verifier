import { Certificate } from '../models/Certificate';
import { VerificationLog } from '../models/VerificationLog';
import { Institution } from '../models/Institution';
import { User } from '../models/User';

export const getDashboardStats = async (opts?: { institutionId?: string | null; role?: string }) => {
  try {
    const certFilter: any = {};
    const logFilter: any = {};

    if (opts?.role === 'ADMIN' && opts.institutionId) {
      certFilter.institutionId = opts.institutionId;
      logFilter.institutionId = opts.institutionId;
    }

    const [
      totalCertificates,
      validCertificates,
      revokedCertificates,
      ipfsCertificates,
      localCertificates,
      blockchainConfirmed,
      blockchainFailed,
      totalVerifications,
      invalidAttempts,
      pdfVerifications,
      qrVerifications,
      certNumberVerifications,
      totalInstitutions,
      activeInstitutions,
      pendingInstitutions,
      suspendedInstitutions,
      totalUsers,
    ] = await Promise.all([
      Certificate.countDocuments(certFilter),
      Certificate.countDocuments({ ...certFilter, status: 'VALID' }),
      Certificate.countDocuments({ ...certFilter, status: 'REVOKED' }),
      Certificate.countDocuments({ ...certFilter, storageType: 'IPFS' }),
      Certificate.countDocuments({ ...certFilter, storageType: 'LOCAL' }),
      Certificate.countDocuments({ ...certFilter, blockchainStatus: { $in: ['CONFIRMED', 'BLOCKCHAIN_CONFIRMED'] } }),
      Certificate.countDocuments({ ...certFilter, blockchainStatus: { $in: ['FAILED', 'BLOCKCHAIN_FAILED'] } }),
      VerificationLog.countDocuments(logFilter),
      VerificationLog.countDocuments({
        ...logFilter,
        result: { $in: ['INVALID', 'NOT_FOUND', 'HASH_MISMATCH', 'INTEGRITY_WARNING'] },
      }),
      VerificationLog.countDocuments({ ...logFilter, verificationMethod: 'PDF' }),
      VerificationLog.countDocuments({ ...logFilter, verificationMethod: 'QR' }),
      VerificationLog.countDocuments({ ...logFilter, verificationMethod: 'CERTIFICATE_NUMBER' }),
      Institution.countDocuments(),
      Institution.countDocuments({ status: 'ACTIVE' }),
      Institution.countDocuments({ status: 'PENDING' }),
      Institution.countDocuments({ status: 'SUSPENDED' }),
      User.countDocuments(),
    ]);

    return {
      totalCertificates,
      validCertificates,
      revokedCertificates,
      ipfsCertificates,
      localCertificates,
      blockchainConfirmed,
      blockchainFailed,
      totalVerifications,
      invalidAttempts,
      platformMetrics: {
        totalInstitutions,
        activeInstitutions,
        pendingInstitutions,
        suspendedInstitutions,
        totalUsers,
      },
      verificationMethods: {
        pdf: pdfVerifications,
        qr: qrVerifications,
        certificateNumber: certNumberVerifications,
      },
    };
  } catch (err) {
    return {
      totalCertificates: 0,
      validCertificates: 0,
      revokedCertificates: 0,
      ipfsCertificates: 0,
      localCertificates: 0,
      blockchainConfirmed: 0,
      blockchainFailed: 0,
      totalVerifications: 0,
      invalidAttempts: 0,
      platformMetrics: {
        totalInstitutions: 0,
        activeInstitutions: 0,
        pendingInstitutions: 0,
        suspendedInstitutions: 0,
        totalUsers: 0,
      },
      verificationMethods: {
        pdf: 0,
        qr: 0,
        certificateNumber: 0,
      },
    };
  }
};
