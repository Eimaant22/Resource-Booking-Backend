import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  password?: string;

  role: 'super_admin' | 'space_admin' | 'member';

  organizationId?: mongoose.Types.ObjectId;

  department?: string;
  photoUrl?: string;

  isVerified: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

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
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ['super_admin', 'space_admin', 'member'],
      default: 'member',
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },

    department: {
      type: String,
      trim: true,
    },

    photoUrl: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
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

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', UserSchema);