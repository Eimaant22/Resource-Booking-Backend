import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;

  bookingId?: mongoose.Types.ObjectId;

  title: string;

  message: string;

  type:
    | 'booking_confirmation'
    | 'booking_reminder'
    | 'approval'
    | 'rejection'
    | 'check_in'
    | 'general';

  isRead: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        'booking_confirmation',
        'booking_reminder',
        'approval',
        'rejection',
        'check_in',
        'general',
      ],
      default: 'general',
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1 });

export default mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);