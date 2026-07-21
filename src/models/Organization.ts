import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  description?: string;
  logoUrl?: string;

  address?: string;

  timezone: string;

  ownerId: mongoose.Types.ObjectId;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    logoUrl: {
      type: String,
    },

    address: {
      type: String,
      trim: true,
    },

    timezone: {
      type: String,
      default: 'UTC',
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

OrganizationSchema.index({ ownerId: 1 });

export default mongoose.model<IOrganization>(
  'Organization',
  OrganizationSchema
);