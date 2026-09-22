import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import { seedSuperAdminHelper } from '../scripts/seedSuperAdmin';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecertificate';

export const connectDB = async (): Promise<typeof mongoose | null> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    
    // Auto-seed Super Admin and Default Admin accounts
    seedSuperAdminHelper().catch((err) => {
      console.warn('⚠️ Seeding warning:', err.message || err);
    });

    return conn;
  } catch (error: any) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message || 'Unable to connect to MongoDB server'}`);
    return null;
  }
};
