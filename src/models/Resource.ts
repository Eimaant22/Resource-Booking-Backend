import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  name: string;
  description?: string;

  organizationId: mongoose.Types.ObjectId;
  resourceTypeId: mongoose.Types.ObjectId;

  managedBy?: mongoose.Types.ObjectId;

  building?: string;
  floor?: string;

  capacity: number;

  photoUrl?: string;

  amenities: string[];

  approvalRequired: boolean;

  bufferTime: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    resourceTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'ResourceType',
      required: true,
    },

    managedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    building: {
      type: String,
      trim: true,
    },

    floor: {
      type: String,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    photoUrl: {
      type: String,
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    approvalRequired: {
      type: Boolean,
      default: false,
    },

    bufferTime: {
      type: Number,
      default: 0,
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

ResourceSchema.index({ organizationId: 1 });
ResourceSchema.index({ resourceTypeId: 1 });
ResourceSchema.index({ managedBy: 1 });

export default mongoose.model<IResource>(
  'Resource',
  ResourceSchema
);