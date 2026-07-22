import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import Notification from '../models/Notification';
import User from '../models/User';

import { AuthRequest } from '../middleware/auth';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';

/**
 * POST /api/notifications
 * Super Admin / Space Admin
 */
/**
 * POST /api/notifications
 * Super Admin / Space Admin
 */
export const createNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loggedInUserId = req.userId!.toString();

    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const {
      userId,
      bookingId,
      title,
      message,
      type,
    } = req.body;

    if (!userId || !title || !message) {
      throw new AppError(
        'User, title and message are required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      throw new AppError(
        'Invalid user id.',
        400,
        'INVALID_ID'
      );
    }

    const receiver = await User.findById(String(userId));

    if (!receiver) {
      throw new AppError(
        'Receiver not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    // Space Admin can only notify users in their own organization
    if (
      loggedInUser.role === 'space_admin' &&
      loggedInUser.organizationId?.toString() !==
        receiver.organizationId?.toString()
    ) {
      throw new AppError(
        'You are not authorized to send notifications to this user.',
        403,
        'FORBIDDEN'
      );
    }

    const notification = await Notification.create({
      userId: receiver._id,
      bookingId,
      title,
      message,
      type: type || 'general',
    });

    sendSuccess(
      res,
      {
        message: 'Notification created successfully.',
        notification,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications
 * Logged-in User
 */
export const getMyNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const notifications = await Notification.find({
      userId,
    })
      .populate('bookingId', 'title startTime endTime')
      .sort({
        createdAt: -1,
      });

    sendSuccess(res, {
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/:id
 */
export const getNotificationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid notification id.',
        400,
        'INVALID_ID'
      );
    }

    const notification = await Notification.findById(id)
      .populate('bookingId', 'title startTime endTime');

    if (!notification) {
      throw new AppError(
        'Notification not found.',
        404,
        'NOTIFICATION_NOT_FOUND'
      );
    }

    if (
      notification.userId.toString() !== req.userId!.toString()
    ) {
      throw new AppError(
        'Unauthorized.',
        403,
        'FORBIDDEN'
      );
    }

    sendSuccess(res, {
      notification,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid notification id.',
        400,
        'INVALID_ID'
      );
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      throw new AppError(
        'Notification not found.',
        404,
        'NOTIFICATION_NOT_FOUND'
      );
    }

    if (
      notification.userId.toString() !== req.userId!.toString()
    ) {
      throw new AppError(
        'Unauthorized.',
        403,
        'FORBIDDEN'
      );
    }

    notification.isRead = true;

    await notification.save();

    sendSuccess(res, {
      message: 'Notification marked as read.',
      notification,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Notification.updateMany(
      {
        userId: req.userId!.toString(),
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    sendSuccess(res, {
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid notification id.',
        400,
        'INVALID_ID'
      );
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      throw new AppError(
        'Notification not found.',
        404,
        'NOTIFICATION_NOT_FOUND'
      );
    }

    if (
      notification.userId.toString() !== req.userId!.toString()
    ) {
      throw new AppError(
        'Unauthorized.',
        403,
        'FORBIDDEN'
      );
    }

    await notification.deleteOne();

    sendSuccess(res, {
      message: 'Notification deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};