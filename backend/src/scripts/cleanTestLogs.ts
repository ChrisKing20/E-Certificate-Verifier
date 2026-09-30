import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { VerificationLog } from '../models/VerificationLog';
import { Certificate } from '../models/Certificate';

const cleanTestLogs = async () => {
  console.log('🧹 Cleaning test verification logs and backfilling institution IDs...');
  try {
    await connectDB();

    // 1. Delete test logs with non-existent certificates (e.g. ECV-9999-NONEXISTENT) or result NOT_FOUND/INVALID test runs
    const testLogsResult = await VerificationLog.deleteMany({
      $or: [
        { certificateId: /NONEXISTENT/i },
        { certificateId: /TEST/i },
        { certificateId: 'ECV-9999-NONEXISTENT' },
      ],
    });
    console.log(`✅ Deleted ${testLogsResult.deletedCount} non-existent test log entries.`);

    // 2. Backfill institutionId on existing VerificationLogs that match valid certificates
    const allCerts = await Certificate.find({}, { certificateId: 1, institutionId: 1 });
    let backfilledCount = 0;

    for (const cert of allCerts) {
      if (cert.institutionId) {
        const updateRes = await VerificationLog.updateMany(
          { certificateId: cert.certificateId, institutionId: null },
          { $set: { institutionId: cert.institutionId } }
        );
        backfilledCount += updateRes.modifiedCount;
      }
    }
    console.log(`✅ Backfilled institutionId on ${backfilledCount} verification log entries.`);

    console.log('🎉 Cleanup and backfill completed successfully!');
  } catch (err: any) {
    console.error('❌ Clean test logs failed:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

cleanTestLogs();
