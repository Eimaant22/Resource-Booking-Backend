import mongoose, { Document, Schema } from 'mongoose';

export interface IAccessGroup extends Document {
  name: string;

  description?: string;

  organizationId: mongoose.Types.ObjectId;

  users: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const AccessGroupSchema = new Schema<IAccessGroup>(
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

    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

AccessGroupSchema.index({
  organizationId: 1,
  name: 1,
});

export default mongoose.model<IAccessGroup>(
  'AccessGroup',
  AccessGroupSchema
);