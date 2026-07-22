import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  resourceId: mongoose.Types.ObjectId;

  userId: mongoose.Types.ObjectId;

  title: string;

  attendeeCount: number;

  notes?: string;

  startTime: Date;

  endTime: Date;

  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'completed';

  recurringBookingId?: mongoose.Types.ObjectId;

  checkedIn: boolean;

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

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    attendeeCount: {
      type: Number,
      default: 1,
    },

    notes: {
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

    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'completed',
      ],
      default: 'pending',
    },

    recurringBookingId: {
      type: Schema.Types.ObjectId,
      ref: 'RecurringBooking',
    },

    checkedIn: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({
  resourceId: 1,
  startTime: 1,
  endTime: 1,
});

BookingSchema.index({ userId: 1 });

export default mongoose.model<IBooking>(
  'Booking',
  BookingSchema
);