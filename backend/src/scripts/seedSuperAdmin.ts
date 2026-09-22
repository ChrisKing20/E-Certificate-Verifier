import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Platform Super Admin';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@ecertificate.local';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

const seedSuperAdmin = async () => {
  console.log('🚀 Seeding Platform SUPER_ADMIN Account...');
  try {
    await connectDB();

    const existingSuperAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL.toLowerCase() });

    if (existingSuperAdmin) {
      console.log(`ℹ️ SUPER_ADMIN account '${SUPER_ADMIN_EMAIL}' already exists.`);
    } else {
      const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
      const superAdmin = await User.create({
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL.toLowerCase(),
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
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedSuperAdmin();
