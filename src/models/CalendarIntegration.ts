import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendarIntegration extends Document {
  userId: mongoose.Types.ObjectId;

  provider: 'google' | 'outlook';

  accessToken: string;

  refreshToken?: string;

  expiryDate?: Date;

  isConnected: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CalendarIntegrationSchema =
  new Schema<ICalendarIntegration>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      provider: {
        type: String,
        enum: ['google', 'outlook'],
        required: true,
      },

      accessToken: {
        type: String,
        required: true,
      },

      refreshToken: {
        type: String,
      },

      expiryDate: {
        type: Date,
      },

      isConnected: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

CalendarIntegrationSchema.index({
  userId: 1,
  provider: 1,
});

export default mongoose.model<ICalendarIntegration>(
  'CalendarIntegration',
  CalendarIntegrationSchema
);