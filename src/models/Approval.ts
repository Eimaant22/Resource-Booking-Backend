import mongoose, { Document, Schema } from 'mongoose';

export interface IApproval extends Document {
  bookingId: mongoose.Types.ObjectId;

  approvedBy?: mongoose.Types.ObjectId;

  status: 'pending' | 'approved' | 'rejected';

  reason?: string;

  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ApprovalSchema = new Schema<IApproval>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    reason: {
      type: String,
      trim: true,
    },

    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ApprovalSchema.index({ status: 1 });

export default mongoose.model<IApproval>(
  'Approval',
  ApprovalSchema
);