import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const seedSuperAdminHelper = async () => {
  const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Platform Super Admin';
  const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@verifier.org').trim().toLowerCase();
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

  console.log(`🚀 Syncing System Administrator Accounts ('${SUPER_ADMIN_EMAIL}')...`);
  try {
    const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    // 1. Seed / Update SUPER_ADMIN in User collection
    const existingSuperAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL });

    if (existingSuperAdmin) {
      existingSuperAdmin.name = SUPER_ADMIN_NAME;
      existingSuperAdmin.passwordHash = passwordHash;
      existingSuperAdmin.role = 'SUPER_ADMIN';
      existingSuperAdmin.status = 'ACTIVE';
      existingSuperAdmin.emailVerified = true;
      await existingSuperAdmin.save();
      console.log(`✅ SUPER_ADMIN Account '${SUPER_ADMIN_EMAIL}' synced & active.`);
    } else {
      await User.create({
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        passwordHash,
        role: 'SUPER_ADMIN',
        authProvider: 'LOCAL',
        status: 'ACTIVE',
        emailVerified: true,
      });
      console.log(`✅ SUPER_ADMIN Account '${SUPER_ADMIN_EMAIL}' initialized.`);
    }

    // 2. Seed / Update Default Institutional Admin ('admin@ecertificate.local')
    const defaultAdminEmail = 'admin@ecertificate.local';
    const existingAdminUser = await User.findOne({ email: defaultAdminEmail });

    if (existingAdminUser) {
      existingAdminUser.passwordHash = passwordHash;
      existingAdminUser.role = 'ADMIN';
      existingAdminUser.status = 'ACTIVE';
      await existingAdminUser.save();
      console.log(`✅ Default Institutional Admin '${defaultAdminEmail}' synced & active.`);
    } else {
      await User.create({
        name: 'College Certificate Administrator',
        email: defaultAdminEmail,
        passwordHash,
        role: 'ADMIN',
        authProvider: 'LOCAL',
        status: 'ACTIVE',
        emailVerified: true,
      });
      console.log(`✅ Default Institutional Admin '${defaultAdminEmail}' initialized.`);
    }

    // 3. Legacy Admin sync
    const existingLegacy = await Admin.findOne({ email: defaultAdminEmail });
    if (existingLegacy) {
      existingLegacy.passwordHash = passwordHash;
      await existingLegacy.save();
    } else {
      await Admin.create({
        name: 'College Certificate Administrator',
        email: defaultAdminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      });
    }

  } catch (err: any) {
    console.error('❌ Error seeding accounts:', err.message || err);
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedSuperAdminHelper();
  } catch (err: any) {
    console.error('❌ Database connection error during seed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

if (require.main === module) {
  main();
}
