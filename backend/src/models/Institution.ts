import { Schema, model, Document, Types } from 'mongoose';

export type InstitutionStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export interface IInstitution extends Document {
  name: string;
  institutionCode: string;
  officialEmail: string;
  phone?: string | null;
  website?: string | null;
  logo?: string | null;
  description?: string | null;
  status: InstitutionStatus;
  createdBy?: Types.ObjectId | string | null;
  approvedBy?: Types.ObjectId | string | null;
  approvedAt?: Date | null;
  rejectedBy?: Types.ObjectId | string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    institutionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    officialEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    website: {
      type: String,
      default: null,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Institution = model<IInstitution>('Institution', institutionSchema);
