import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckIn extends Document {
  bookingId: mongoose.Types.ObjectId;

  userId: mongoose.Types.ObjectId;

  checkInTime: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    checkInTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);



export default mongoose.model<ICheckIn>(
  'CheckIn',
  CheckInSchema
);