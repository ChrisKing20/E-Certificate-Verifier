import { connectDB } from '../config/db';
import { migrateLocalCertificatesToIPFS } from '../services/certificateService';
import mongoose from 'mongoose';

const runMigration = async () => {
  console.log('🔄 Initiating Phase 5 IPFS Certificate Migration...');
  try {
    await connectDB();
    const result = await migrateLocalCertificatesToIPFS();
    console.log('✅ Migration Process Completed!');
    console.log(`Total Certificates Analyzed: ${result.total}`);
    console.log(`Successfully Uploaded to IPFS: ${result.migratedCount}`);
    console.log(`Failed: ${result.failedCount}`);
    console.log('Details:', JSON.stringify(result.details, null, 2));
  } catch (err: any) {
    console.error('❌ Migration failed with error:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runMigration();
