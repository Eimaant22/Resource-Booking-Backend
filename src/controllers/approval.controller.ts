import { Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

import Approval from '../models/Approval';
import Booking from '../models/Booking';
import User from '../models/User';
import AuditLog from '../models/AuditLog';

import { AuthRequest } from '../middleware/auth';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';

/**
 * GET /api/approvals
 * Super Admin / Space Admin
 */
export const getApprovals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    const approvals = await Approval.find(filter)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'resourceId', select: 'name type' },
          { path: 'userId', select: 'name email' },
        ],
      })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    sendSuccess(res, { approvals });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/approvals/:id
 */
export const getApprovalById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid approval id.', 400, 'INVALID_ID');
    }

    const approval = await Approval.findById(id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'resourceId', select: 'name type' },
          { path: 'userId', select: 'name email' },
        ],
      })
      .populate('approvedBy', 'name email');

    if (!approval) {
      throw new AppError('Approval not found.', 404, 'APPROVAL_NOT_FOUND');
    }

    sendSuccess(res, { approval });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/approvals/:bookingId/approve
 */
export const approveBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookingId = req.params.bookingId.toString();

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new AppError(
        'Invalid booking id.',
        400,
        'INVALID_ID'
      );
    }

    const approverId = req.userId!.toString();

    const approver = await User.findById(approverId);

    if (!approver) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError(
        'Booking not found.',
        404,
        'BOOKING_NOT_FOUND'
      );
    }

    if (booking.status === 'approved') {
      throw new AppError(
        'Booking is already approved.',
        400,
        'BOOKING_ALREADY_APPROVED'
      );
    }

    if (booking.status === 'rejected') {
      throw new AppError(
        'Booking has already been rejected.',
        400,
        'BOOKING_ALREADY_REJECTED'
      );
    }

    booking.status = 'approved';

    await booking.save();

    const approval = await Approval.findOneAndUpdate(
      {
        bookingId,
      },
      {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date(),
        reason: req.body.reason,
      },
      {
        new: true,
        upsert: true,
      }
    );

    await Notification.create({
      userId: booking.userId,
      bookingId: booking._id,
      title: 'Booking Approved',
      message: 'Your booking request has been approved.',
      type: 'approval',
    });

    await AuditLog.create({
      userId: approverId,
      action: 'Approve Booking',
      module: 'Booking',
      entityId: booking._id,
      description: `Approved booking "${booking.title}"`,
      ipAddress: req.ip,
    });

    sendSuccess(res, {
      message: 'Booking approved successfully.',
      approval,
    });
  } catch (err) {
    next(err);
  }
};
/**
 * PATCH /api/approvals/:bookingId/reject
 */
export const rejectBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookingId = req.params.bookingId.toString();

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new AppError(
        'Invalid booking id.',
        400,
        'INVALID_ID'
      );
    }

    const approverId = req.userId!.toString();

    const approver = await User.findById(approverId);

    if (!approver) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError(
        'Booking not found.',
        404,
        'BOOKING_NOT_FOUND'
      );
    }

    if (booking.status === 'approved') {
      throw new AppError(
        'Booking has already been approved.',
        400,
        'BOOKING_ALREADY_APPROVED'
      );
    }

    if (booking.status === 'rejected') {
      throw new AppError(
        'Booking is already rejected.',
        400,
        'BOOKING_ALREADY_REJECTED'
      );
    }

    booking.status = 'rejected';

    await booking.save();

    const approval = await Approval.findOneAndUpdate(
      {
        bookingId,
      },
      {
        status: 'rejected',
        approvedBy: approverId,
        approvedAt: new Date(),
        reason: req.body.reason,
      },
      {
        new: true,
        upsert: true,
      }
    );

    await Notification.create({
      userId: booking.userId,
      bookingId: booking._id,
      title: 'Booking Rejected',
      message:
        req.body.reason ||
        'Your booking request has been rejected.',
      type: 'rejection',
    });

    await AuditLog.create({
      userId: approverId,
      action: 'Reject Booking',
      module: 'Booking',
      entityId: booking._id,
      description: `Rejected booking "${booking.title}"`,
      ipAddress: req.ip,
    });

    sendSuccess(res, {
      message: 'Booking rejected successfully.',
      approval,
    });
  } catch (err) {
    next(err);
  }
};