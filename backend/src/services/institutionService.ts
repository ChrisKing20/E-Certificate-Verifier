import bcrypt from 'bcrypt';
import { Institution, IInstitution, InstitutionStatus } from '../models/Institution';
import { User, IUser } from '../models/User';

export interface RegisterInstitutionDto {
  institutionName: string;
  institutionCode: string;
  officialEmail: string;
  phone?: string;
  website?: string;
  description?: string;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
  googleId?: string;
}

export const registerInstitution = async (data: RegisterInstitutionDto) => {
  const codeNormalized = data.institutionCode.trim().toUpperCase();
  const instEmailNormalized = data.officialEmail.trim().toLowerCase();
  const adminEmailNormalized = data.adminEmail.trim().toLowerCase();

  // 1. Check duplicate institutionCode or officialEmail
  const existingInst = await Institution.findOne({
    $or: [{ institutionCode: codeNormalized }, { officialEmail: instEmailNormalized }],
  });

  if (existingInst) {
    throw {
      statusCode: 409,
      message: `An institution with code '${codeNormalized}' or email '${instEmailNormalized}' already exists.`,
    };
  }

  // 2. Check duplicate admin email in User collection
  const existingUser = await User.findOne({ email: adminEmailNormalized });
  if (existingUser) {
    throw {
      statusCode: 409,
      message: `A user with email '${adminEmailNormalized}' already exists.`,
    };
  }

  // 3. Hash password if provided
  let passwordHash = null;
  if (data.adminPassword) {
    passwordHash = await bcrypt.hash(data.adminPassword, 10);
  }

  // 4. Create Institution in PENDING state
  const institution = await Institution.create({
    name: data.institutionName.trim(),
    institutionCode: codeNormalized,
    officialEmail: instEmailNormalized,
    phone: data.phone ? data.phone.trim() : null,
    website: data.website ? data.website.trim() : null,
    description: data.description ? data.description.trim() : null,
    status: 'PENDING',
  });

  // 5. Create Admin User in PENDING state
  const adminUser = await User.create({
    name: data.adminName.trim(),
    email: adminEmailNormalized,
    passwordHash,
    googleId: data.googleId || undefined,
    role: 'ADMIN',
    institutionId: institution._id,
    authProvider: data.googleId ? 'GOOGLE' : 'LOCAL',
    status: 'PENDING', // Pending Super Admin approval
  });

  institution.createdBy = adminUser._id;
  await institution.save();

  return {
    institution,
    adminUser: {
      id: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      status: adminUser.status,
    },
  };
};

export const getInstitutions = async (query: { status?: string; search?: string }) => {
  const filter: any = {};
  if (query.status && query.status !== 'ALL') {
    filter.status = query.status;
  }
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { institutionCode: searchRegex }, { officialEmail: searchRegex }];
  }

  const institutions = await Institution.find(filter).sort({ createdAt: -1 });
  return institutions;
};

export const approveInstitution = async (id: string) => {
  const inst = await Institution.findById(id);
  if (!inst) {
    throw { statusCode: 404, message: 'Institution record not found.' };
  }

  inst.status = 'ACTIVE';
  await inst.save();

  // Update associated ADMIN users to ACTIVE status
  await User.updateMany(
    { institutionId: inst._id, role: 'ADMIN' },
    { $set: { status: 'ACTIVE' } }
  );

  return inst;
};

export const rejectInstitution = async (id: string) => {
  const inst = await Institution.findById(id);
  if (!inst) {
    throw { statusCode: 404, message: 'Institution record not found.' };
  }

  inst.status = 'REJECTED';
  await inst.save();

  await User.updateMany(
    { institutionId: inst._id, role: 'ADMIN' },
    { $set: { status: 'SUSPENDED' } }
  );

  return inst;
};

export const suspendInstitution = async (id: string) => {
  const inst = await Institution.findById(id);
  if (!inst) {
    throw { statusCode: 404, message: 'Institution record not found.' };
  }

  inst.status = 'SUSPENDED';
  await inst.save();

  await User.updateMany(
    { institutionId: inst._id, role: 'ADMIN' },
    { $set: { status: 'SUSPENDED' } }
  );

  return inst;
};
