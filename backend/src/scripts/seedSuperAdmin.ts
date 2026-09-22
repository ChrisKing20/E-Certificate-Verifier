import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Platform Super Admin';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@ecertificate.local';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

export const seedSuperAdminHelper = async () => {
  const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Platform Super Admin';
  const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@verifier.org').trim().toLowerCase();
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

  console.log(`🚀 Seeding/Updating Platform SUPER_ADMIN Account ('${SUPER_ADMIN_EMAIL}')...`);
  try {
    const existingSuperAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL });

    const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    if (existingSuperAdmin) {
      existingSuperAdmin.name = SUPER_ADMIN_NAME;
      existingSuperAdmin.passwordHash = passwordHash;
      existingSuperAdmin.role = 'SUPER_ADMIN';
      existingSuperAdmin.status = 'ACTIVE';
      existingSuperAdmin.emailVerified = true;
      await existingSuperAdmin.save();
      console.log(`✅ SUPER_ADMIN Account '${SUPER_ADMIN_EMAIL}' Updated Successfully!`);
    } else {
      const superAdmin = await User.create({
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        passwordHash,
        role: 'SUPER_ADMIN',
        authProvider: 'LOCAL',
        status: 'ACTIVE',
        emailVerified: true,
      });

      console.log('✅ SUPER_ADMIN Account Initialized Successfully!');
      console.log(`Email: ${superAdmin.email}`);
      console.log(`Role: ${superAdmin.role}`);
    }
  } catch (err: any) {
    console.error('❌ Error seeding SUPER_ADMIN:', err.message || err);
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
