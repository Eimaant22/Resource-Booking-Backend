import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;

  title: string;

  message: string;

  type:
    | 'booking_created'
    | 'booking_approved'
    | 'booking_rejected'
    | 'booking_cancelled'
    | 'booking_reminder'
    | 'system';

  bookingId?: mongoose.Types.ObjectId;

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
        'booking_created',
        'booking_approved',
        'booking_rejected',
        'booking_cancelled',
        'booking_reminder',
        'system',
      ],
      required: true,
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
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
NotificationSchema.index({ isRead: 1 });

export default mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);