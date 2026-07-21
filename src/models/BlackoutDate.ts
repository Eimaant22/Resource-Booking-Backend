import mongoose, { Document, Schema } from 'mongoose';

export interface IBlackoutDate extends Document {
  resourceId: mongoose.Types.ObjectId;

  startTime: Date;

  endTime: Date;

  reason: string;

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

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
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

BlackoutDateSchema.index({ resourceId: 1 });
BlackoutDateSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model<IBlackoutDate>(
  'BlackoutDate',
  BlackoutDateSchema
);