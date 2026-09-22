import { Schema, model, Document } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';
export type AuthProviderType = 'LOCAL' | 'GOOGLE' | 'LOCAL_AND_GOOGLE';
export type UserAccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  role: UserRole;
  institutionId?: Schema.Types.ObjectId | string | null;
  emailVerified: boolean;
  authProvider: AuthProviderType;
  status: UserAccountStatus;
  profileImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'USER'],
      default: 'USER',
      index: true,
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE', 'LOCAL_AND_GOOGLE'],
      default: 'LOCAL',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
