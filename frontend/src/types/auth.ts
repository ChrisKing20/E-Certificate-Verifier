export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';
export type InstitutionStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface Institution {
  _id: string;
  name: string;
  institutionCode: string;
  officialEmail: string;
  phone?: string;
  website?: string;
  logo?: string;
  description?: string;
  status: InstitutionStatus;
  adminName?: string;
  adminEmail?: string;
  proposedAdminName?: string;
  proposedAdminEmail?: string;
  proposedAdminStatus?: string;
  proposedAdminCreatedAt?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt?: string;
}

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string | Institution | null;
  status?: AccountStatus;
  authProvider?: string;
  profileImage?: string;
}

export interface AdminUser extends AuthUser {
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  admin?: AuthUser;
}

export interface InstitutionRegisterPayload {
  institutionName: string;
  institutionCode: string;
  officialEmail: string;
  phone?: string;
  website?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

