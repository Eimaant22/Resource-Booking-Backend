import mongoose, { Document, Schema } from 'mongoose';

export interface IBookingSeries extends Document {
  createdBy: mongoose.Types.ObjectId;

  organizationId: mongoose.Types.ObjectId;

  frequency: 'daily' | 'weekly' | 'monthly';

  interval: number;

  startDate: Date;

  endDate: Date;

  daysOfWeek?: number[];

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const BookingSeriesSchema = new Schema<IBookingSeries>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },

    interval: {
      type: Number,
      default: 1,
      min: 1,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

BookingSeriesSchema.index({ createdBy: 1 });
BookingSeriesSchema.index({ organizationId: 1 });

export default mongoose.model<IBookingSeries>(
  'BookingSeries',
  BookingSeriesSchema
);