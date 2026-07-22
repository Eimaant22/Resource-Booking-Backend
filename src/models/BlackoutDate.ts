import mongoose, { Document, Schema } from 'mongoose';

export interface IBlackoutDate extends Document {
  resourceId: mongoose.Types.ObjectId;

  startDate: Date;

  endDate: Date;

  reason?: string;

  createdBy: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const BlackoutDateSchema = new Schema<IBlackoutDate>(
  {
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BlackoutDateSchema.index({
  resourceId: 1,
  startDate: 1,
  endDate: 1,
});

export default mongoose.model<IBlackoutDate>(
  'BlackoutDate',
  BlackoutDateSchema
);