import mongoose, { Document, Schema } from 'mongoose';

export interface IResourceType extends Document {
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ResourceTypeSchema = new Schema<IResourceType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    icon: {
      type: String,
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

export default mongoose.model<IResourceType>(
  'ResourceType',
  ResourceTypeSchema
);