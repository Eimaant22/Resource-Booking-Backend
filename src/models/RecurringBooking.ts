import mongoose, { Document, Schema } from 'mongoose';

export interface IRecurringBooking extends Document {
  userId: mongoose.Types.ObjectId;

  resourceId: mongoose.Types.ObjectId;

  rrule: string;

  startDate: Date;

  endDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const RecurringBookingSchema = new Schema<IRecurringBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },

    rrule: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

RecurringBookingSchema.index({
  resourceId: 1,
});

export default mongoose.model<IRecurringBooking>(
  'RecurringBooking',
  RecurringBookingSchema
);