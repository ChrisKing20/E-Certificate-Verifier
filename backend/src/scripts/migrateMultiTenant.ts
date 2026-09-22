import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Institution } from '../models/Institution';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import { Certificate } from '../models/Certificate';

const migrateMultiTenant = async () => {
  console.log('🔄 Initiating Multi-Tenant Data Migration...');
  try {
    await connectDB();

    // 1. Ensure Default Institution exists
    let defaultInst = await Institution.findOne({ institutionCode: 'INST001' });

    if (!defaultInst) {
      defaultInst = await Institution.create({
        name: 'Default Academic Institution',
        institutionCode: 'INST001',
        officialEmail: 'contact@default.college.edu',
        status: 'ACTIVE',
        description: 'Default institutional tenant for legacy certificate records.',
      });
      console.log('✅ Created default institution: Default Academic Institution (INST001)');
    }

    // 2. Migrate legacy Admin records to User collection
    const legacyAdmins = await Admin.find({});
    let adminMigratedCount = 0;

    for (const legacy of legacyAdmins) {
      let user = await User.findOne({ email: legacy.email.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: legacy.name,
          email: legacy.email.toLowerCase(),
          passwordHash: legacy.passwordHash,
          role: legacy.role || 'ADMIN',
          institutionId: defaultInst._id,
          authProvider: 'LOCAL',
          status: legacy.isActive ? 'ACTIVE' : 'SUSPENDED',
        });
        adminMigratedCount++;
      }
    }
    console.log(`✅ Migrated ${adminMigratedCount} legacy admin records to User collection.`);

    // 3. Link legacy certificates to default institution
    const unlinkedCerts = await Certificate.updateMany(
      { $or: [{ institutionId: null }, { institutionId: { $exists: false } }] },
      { $set: { institutionId: defaultInst._id } }
    );
    console.log(`✅ Linked ${unlinkedCerts.modifiedCount} legacy certificates to default institution INST001.`);

    console.log('🎉 Multi-Tenant Data Migration Completed Successfully!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrateMultiTenant();
