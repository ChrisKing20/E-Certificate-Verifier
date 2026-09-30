import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Institution } from '../models/Institution';
import { User } from '../models/User';
import { Certificate } from '../models/Certificate';
import { VerificationLog } from '../models/VerificationLog';

const cleanTestInstitutions = async () => {
  console.log('🧹 Cleaning test institution entries and associated test users...');
  try {
    await connectDB();

    // 1. Identify test institutions
    const testInsts = await Institution.find({
      $or: [
        { name: /Test Institution/i },
        { name: /Dupe Inst/i },
        { institutionCode: /INSTA_/i },
        { institutionCode: /DUPE_/i },
        { officialEmail: /@insta\.edu$/i },
        { officialEmail: /@test\.edu$/i },
      ],
    });

    const testInstIds = testInsts.map((i) => i._id);
    console.log(`🔍 Found ${testInsts.length} test institution records to delete.`);

    if (testInstIds.length > 0) {
      // 2. Delete test users associated with these test institutions or test emails
      const userDelResult = await User.deleteMany({
        $or: [
          { institutionId: { $in: testInstIds } },
          { email: /@insta\.edu$/i },
          { email: /@test\.edu$/i },
        ],
      });
      console.log(`✅ Deleted ${userDelResult.deletedCount} associated test admin users.`);

      // 3. Delete test certificates and verification logs if any linked to test institutions
      const certDelResult = await Certificate.deleteMany({ institutionId: { $in: testInstIds } });
      console.log(`✅ Deleted ${certDelResult.deletedCount} test certificates.`);

      const logDelResult = await VerificationLog.deleteMany({ institutionId: { $in: testInstIds } });
      console.log(`✅ Deleted ${logDelResult.deletedCount} test verification logs.`);

      // 4. Delete the test institutions
      const instDelResult = await Institution.deleteMany({ _id: { $in: testInstIds } });
      console.log(`✅ Deleted ${instDelResult.deletedCount} test institution records.`);
    } else {
      console.log('ℹ️ No test institutions found in database.');
    }

    // 5. Ensure legitimate approved institutions remain (and update legacy unlinked user accounts)
    const activeInsts = await Institution.find({ status: 'ACTIVE' });
    console.log(`🏛️ Active Approved Institutions remaining (${activeInsts.length}):`);
    activeInsts.forEach((inst) => {
      console.log(`   - ${inst.name} [Code: ${inst.institutionCode}] (Status: ${inst.status})`);
    });

    console.log('🎉 Test institution cleanup completed successfully!');
  } catch (err: any) {
    console.error('❌ Clean test institutions failed:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

cleanTestInstitutions();
