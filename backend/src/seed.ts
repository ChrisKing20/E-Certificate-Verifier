import bcrypt from 'bcrypt';
import { connectDB } from './config/db';
import { Admin } from './models/Admin';
import mongoose from 'mongoose';

async function seedDatabase() {
  console.log('🌱 Connecting to MongoDB to seed Administrator account...');
  await connectDB();

  const adminEmail = 'admin@ecertificate.local';
  const plainPassword = 'Admin@123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const existing = await Admin.findOne({ email: adminEmail });
  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`✅ Administrator account updated: ${existing.email}`);
  } else {
    const newAdmin = await Admin.create({
      name: 'College Certificate Administrator',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    });
    console.log(`✅ Institutional Administrator created: ${newAdmin.email}`);
  }

  console.log('🎉 MongoDB seeding complete. 0 mock certificates created.');
  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
