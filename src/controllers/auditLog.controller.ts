import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import AuditLog from '../models/AuditLog';

import { AuthRequest } from '../middleware/auth';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';

/**
 * GET /api/audit-logs
 */
export const getAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const { module, action } = req.query;

    const filter: any = {};

    if (module) {
      filter.module = module;
    }

    if (action) {
      filter.action = action;
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    sendSuccess(res, {
      logs,
    });

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/audit-logs/:id
 */
export const getAuditLogById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid audit log id.',
        400,
        'INVALID_ID'
      );
    }

    const log = await AuditLog.findById(id)
      .populate('userId', 'name email role');

    if (!log) {
      throw new AppError(
        'Audit log not found.',
        404,
        'AUDIT_LOG_NOT_FOUND'
      );
    }

    sendSuccess(res, {
      log,
    });

  } catch (err) {
    next(err);
  }
};