import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Institution } from '../models/Institution';
import { User } from '../models/User';

const inspectData = async () => {
  try {
    await connectDB();
    const insts = await Institution.find({}).lean();
    console.log('INSTITUTIONS_IN_DB:', JSON.stringify(insts, null, 2));

    const users = await User.find({ role: 'ADMIN' }).lean();
    console.log('ADMIN_USERS_IN_DB:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

inspectData();
