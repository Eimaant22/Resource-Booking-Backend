import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;

  action: string;

  module: string;

  entityId?: mongoose.Types.ObjectId;

  description?: string;

  ipAddress?: string;

  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    action: {
      type: String,
      required: true,
    },

    module: {
      type: String,
      required: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
    },

    description: {
      type: String,
    },

    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({
  module: 1,
  createdAt: -1,
});

export default mongoose.model<IAuditLog>(
  'AuditLog',
  AuditLogSchema
);