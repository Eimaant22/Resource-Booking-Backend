import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import Booking from '../models/Booking';
import Resource from '../models/Resource';
import User from '../models/User';
import Approval from '../models/Approval';
import CheckIn from '../models/CheckIn';
import BlackoutDate from '../models/BlackoutDate';
import RecurringBooking from '../models/RecurringBooking';
import AuditLog from '../models/AuditLog';

import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

/**
 * POST /api/bookings
 * Any authenticated user
 */
export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const {
      resourceId,
      title,
      attendeeCount,
      notes,
      startTime,
      endTime,
      rrule,
    } = req.body;

    if (
      !resourceId ||
      !title ||
      !startTime ||
      !endTime
    ) {
      throw new AppError(
        'Missing required fields.',
        422,
        'VALIDATION_ERROR'
      );
    }

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      throw new AppError(
        'Invalid resource id.',
        400,
        'INVALID_ID'
      );
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      throw new AppError(
        'Resource not found.',
        404,
        'RESOURCE_NOT_FOUND'
      );
    }

    if (!resource.isActive) {
      throw new AppError(
        'Resource is inactive.',
        400,
        'RESOURCE_INACTIVE'
      );
    }

    if (
      resource.organizationId.toString() !==
      user.organizationId?.toString()
    ) {
      throw new AppError(
        'Resource belongs to another organization.',
        403,
        'FORBIDDEN'
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      throw new AppError(
        'End time must be after start time.',
        422,
        'INVALID_TIME'
      );
    }

    if (
      attendeeCount &&
      resource.capacity &&
      attendeeCount > resource.capacity
    ) {
      throw new AppError(
        'Attendee count exceeds resource capacity.',
        422,
        'CAPACITY_EXCEEDED'
      );
    }

    // Check blackout dates
    const blackout = await BlackoutDate.findOne({
      resourceId,
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (blackout) {
      throw new AppError(
        'This resource is unavailable during the selected time.',
        409,
        'BLACKOUT_DATE'
      );
    }

    // Check booking conflicts
    const conflict = await Booking.findOne({
      resourceId,
      status: {
        $nin: ['cancelled', 'rejected'],
      },
      startTime: {
        $lt: end,
      },
      endTime: {
        $gt: start,
      },
    });

    if (conflict) {
      throw new AppError(
        'This resource is already booked for the selected time.',
        409,
        'BOOKING_CONFLICT'
      );
    }

    const booking = await Booking.create({
      resourceId,
      userId,
      title,
      attendeeCount,
      notes,
      startTime: start,
      endTime: end,
      status: resource.requiresApproval
        ? 'pending'
        : 'approved',
    });

    // Save recurring booking if provided
    if (rrule) {
      await RecurringBooking.create({
        userId,
        resourceId,
        rrule,
        startDate: start,
        endDate: end,
      });
    }

    if (resource.requiresApproval) {
      await Approval.create({
        bookingId: booking._id,
        status: 'pending',
      });

      await Notification.create({
        userId: booking.userId,
        bookingId: booking._id,
        title: 'Booking Submitted',
        message:
          'Your booking request has been submitted and is waiting for approval.',
        type: 'general',
      });
    } else {
      await Notification.create({
        userId: booking.userId,
        bookingId: booking._id,
        title: 'Booking Confirmed',
        message:
          'Your booking has been confirmed successfully.',
        type: 'booking_confirmation',
      });
    }

    // Audit Log
    await AuditLog.create({
      userId,
      action: 'CREATE',
      module: 'BOOKING',
      entityId: booking._id,
      description: 'Booking created successfully.',
      ipAddress: req.ip,
    });

    sendSuccess(
      res,
      {
        message: resource.requiresApproval
          ? 'Booking submitted for approval.'
          : 'Booking created successfully.',
        booking,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};
/**
 * GET /api/bookings
 */
export const getBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const { status } = req.query;

    const filter: any = {};

    if (
      user.role === 'member' ||
      user.role === 'guest'
    ) {
      filter.userId = user._id;
    }

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate(
        'resourceId',
        'name type building location'
      )
      .populate(
        'userId',
        'name email department'
      )
      .sort({
        startTime: 1,
      });

    sendSuccess(res, {
      bookings,
    });
  } catch (err) {
    next(err);
  }
};
/**
 * GET /api/bookings/:id
 */
export const getBookingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid booking id.',
        400,
        'INVALID_ID'
      );
    }

    const booking = await Booking.findById(id)
      .populate('resourceId')
      .populate('userId', 'name email');

    if (!booking) {
      throw new AppError(
        'Booking not found.',
        404,
        'BOOKING_NOT_FOUND'
      );
    }

    sendSuccess(res, {
      booking,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id
 * Booking Owner / Super Admin / Space Admin
 */
export const updateBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid booking id.',
        400,
        'INVALID_ID'
      );
    }

    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      throw new AppError(
        'Booking not found.',
        404,
        'BOOKING_NOT_FOUND'
      );
    }

    const isOwner =
      booking.userId.toString() === userId;

    const isAdmin =
      user.role === 'super_admin' ||
      user.role === 'space_admin';

    if (!isOwner && !isAdmin) {
      throw new AppError(
        'You are not authorized to update this booking.',
        403,
        'FORBIDDEN'
      );
    }

    const {
      title,
      attendeeCount,
      notes,
      startTime,
      endTime,
      rrule,
    } = req.body;

    if (title !== undefined) {
      booking.title = title;
    }

    if (attendeeCount !== undefined) {
      booking.attendeeCount = attendeeCount;
    }

    if (notes !== undefined) {
      booking.notes = notes;
    }

    if (startTime !== undefined) {
      booking.startTime = new Date(startTime);
    }

    if (endTime !== undefined) {
      booking.endTime = new Date(endTime);
    }

    if (booking.endTime <= booking.startTime) {
      throw new AppError(
        'End time must be after start time.',
        422,
        'INVALID_TIME'
      );
    }

    // Check blackout dates
    const blackout = await BlackoutDate.findOne({
      resourceId: booking.resourceId,
      _id: { $ne: booking._id },
      startDate: { $lt: booking.endTime },
      endDate: { $gt: booking.startTime },
    });

    if (blackout) {
      throw new AppError(
        'Resource is unavailable during the selected time.',
        409,
        'BLACKOUT_DATE'
      );
    }

    // Check booking conflicts
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      resourceId: booking.resourceId,
      status: {
        $nin: ['cancelled', 'rejected'],
      },
      startTime: {
        $lt: booking.endTime,
      },
      endTime: {
        $gt: booking.startTime,
      },
    });

    if (conflict) {
      throw new AppError(
        'Selected time slot is already booked.',
        409,
        'BOOKING_CONFLICT'
      );
    }

    await booking.save();

    // Update recurring booking if exists
    if (rrule) {
      await RecurringBooking.findOneAndUpdate(
        {
          userId,
          resourceId: booking.resourceId,
        },
        {
          rrule,
          startDate: booking.startTime,
          endDate: booking.endTime,
        },
        {
          upsert: true,
        }
      );
    }

    // Notification
    await Notification.create({
      userId: booking.userId,
      bookingId: booking._id,
      title: 'Booking Updated',
      message: 'Your booking details have been updated.',
      type: 'general',
    });

    // Audit Log
    await AuditLog.create({
      userId,
      action: 'UPDATE',
      module: 'BOOKING',
      entityId: booking._id,
      description: 'Booking updated successfully.',
      ipAddress: req.ip,
    });

    sendSuccess(res, {
      message: 'Booking updated successfully.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};
/**
 * PATCH /api/bookings/:id/status
 * Super Admin / Space Admin
 */
export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid booking id.',
        400,
        'INVALID_ID'
      );
    }

    const { status } = req.body;

    const allowedStatuses = [
      'pending',
      'approved',
      'rejected',
      'cancelled',
      'completed',
    ];

    if (!allowedStatuses.includes(status)) {
      throw new AppError(
        'Invalid booking status.',
        422,
        'VALIDATION_ERROR'
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      throw new AppError(
        'Booking not found.',
        404,
        'BOOKING_NOT_FOUND'
      );
    }

    booking.status = status;

    await booking.save();

    sendSuccess(res, {
      message: 'Booking status updated successfully.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/bookings/:id
 * Booking Owner / Super Admin
 */
export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid booking id.',
        400,
        'INVALID_ID'
      );
    }

    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      throw new AppError(
        'Booking not found.',
        404,
        'BOOKING_NOT_FOUND'
      );
    }

    const isOwner =
      booking.userId.toString() === userId;

    const isAdmin =
      user.role === 'super_admin';

    if (!isOwner && !isAdmin) {
      throw new AppError(
        'You are not authorized to cancel this booking.',
        403,
        'FORBIDDEN'
      );
    }

    booking.status = 'cancelled';

    await booking.save();

    // Delete recurring booking if one exists
    await RecurringBooking.deleteOne({
      userId: booking.userId,
      resourceId: booking.resourceId,
    });

    // Notification
    await Notification.create({
      userId: booking.userId,
      bookingId: booking._id,
      title: 'Booking Cancelled',
      message: 'Your booking has been cancelled successfully.',
      type: 'general',
    });

    // Audit Log
    await AuditLog.create({
      userId,
      action: 'CANCEL',
      module: 'BOOKING',
      entityId: booking._id,
      description: 'Booking cancelled successfully.',
      ipAddress: req.ip,
    });

    sendSuccess(res, {
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

export const checkInBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookingId = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new AppError(
        'Invalid booking id.',
        400,
        'INVALID_ID'
      );
    }

    const userId = req.userId!.toString();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError(
        'Booking not found.',
        404,
        'BOOKING_NOT_FOUND'
      );
    }

    if (booking.userId.toString() !== userId) {
      throw new AppError(
        'You are not authorized to check in for this booking.',
        403,
        'FORBIDDEN'
      );
    }

    if (booking.status !== 'approved') {
      throw new AppError(
        'Only approved bookings can be checked in.',
        400,
        'INVALID_BOOKING_STATUS'
      );
    }

    const existingCheckIn = await CheckIn.findOne({
      bookingId,
    });

    if (existingCheckIn) {
      throw new AppError(
        'You have already checked in.',
        409,
        'ALREADY_CHECKED_IN'
      );
    }

    const checkIn = await CheckIn.create({
      bookingId,
      userId,
    });

    booking.status = 'completed';
    await booking.save();

    await Notification.create({
      userId,
      bookingId,
      title: 'Check-In Successful',
      message: 'You have successfully checked in.',
      type: 'check_in',
    });

    await AuditLog.create({
      userId,
      action: 'CHECK_IN',
      module: 'BOOKING',
      entityId: booking._id,
      description: 'User checked in successfully.',
      ipAddress: req.ip,
    });

    sendSuccess(res, {
      message: 'Checked in successfully.',
      checkIn,
    });
  } catch (err) {
    next(err);
  }
};
