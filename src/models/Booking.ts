import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  resourceId: mongoose.Types.ObjectId;

  bookedBy: mongoose.Types.ObjectId;

  organizationId: mongoose.Types.ObjectId;

  title: string;

  description?: string;

  startTime: Date;

  endTime: Date;

  attendees: number;

  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'completed'
    | 'expired';

  approvalRequired: boolean;

  approvedBy?: mongoose.Types.ObjectId;

  approvedAt?: Date;

  rejectionReason?: string;

  checkInRequired: boolean;

  checkedIn: boolean;

  checkedInAt?: Date;

  isRecurring: boolean;

  bookingSeriesId?: mongoose.Types.ObjectId;

  cancelledBy?: mongoose.Types.ObjectId;

  cancellationReason?: string;

  createdAt: Date;

  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },

    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    attendees: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'completed',
        'expired',
      ],
      default: 'approved',
    },

    approvalRequired: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    approvedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    checkInRequired: {
      type: Boolean,
      default: false,
    },

    checkedIn: {
      type: Boolean,
      default: false,
    },

    checkedInAt: {
      type: Date,
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    bookingSeriesId: {
      type: Schema.Types.ObjectId,
      ref: 'BookingSeries',
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ resourceId: 1 });
BookingSchema.index({ bookedBy: 1 });
BookingSchema.index({ organizationId: 1 });
BookingSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);