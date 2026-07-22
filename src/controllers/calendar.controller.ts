import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import CalendarIntegration from '../models/CalendarIntegration';
import User from '../models/User';

import { AuthRequest } from '../middleware/auth';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';

/**
 * POST /api/calendar
 * Connect Calendar
 */
export const connectCalendar = async (
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
      provider,
      accessToken,
      refreshToken,
      expiryDate,
    } = req.body;

    if (!provider || !accessToken) {
      throw new AppError(
        'Provider and access token are required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    if (!['google', 'outlook'].includes(provider)) {
      throw new AppError(
        'Invalid calendar provider.',
        422,
        'VALIDATION_ERROR'
      );
    }

    const existing = await CalendarIntegration.findOne({
      userId,
      provider,
    });

    if (existing) {
      throw new AppError(
        'Calendar already connected.',
        409,
        'CALENDAR_ALREADY_CONNECTED'
      );
    }

    const integration = await CalendarIntegration.create({
      userId,
      provider,
      accessToken,
      refreshToken,
      expiryDate,
      isConnected: true,
    });

    sendSuccess(
      res,
      {
        message: 'Calendar connected successfully.',
        integration,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/calendar
 */
export const getCalendarIntegration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const integrations =
      await CalendarIntegration.find({
        userId,
      }).sort({
        createdAt: -1,
      });

    sendSuccess(res, {
      integrations,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/calendar
 */
export const updateCalendarIntegration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const { provider } = req.body;

    if (!provider) {
      throw new AppError(
        'Provider is required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    const integration =
      await CalendarIntegration.findOne({
        userId,
        provider,
      });

    if (!integration) {
      throw new AppError(
        'Calendar integration not found.',
        404,
        'CALENDAR_NOT_FOUND'
      );
    }

    const {
      accessToken,
      refreshToken,
      expiryDate,
      isConnected,
    } = req.body;

    if (accessToken !== undefined) {
      integration.accessToken = accessToken;
    }

    if (refreshToken !== undefined) {
      integration.refreshToken = refreshToken;
    }

    if (expiryDate !== undefined) {
      integration.expiryDate = expiryDate;
    }

    if (isConnected !== undefined) {
      integration.isConnected = isConnected;
    }

    await integration.save();

    sendSuccess(res, {
      message: 'Calendar integration updated successfully.',
      integration,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/calendar
 */
export const disconnectCalendar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const { provider } = req.body;

    if (!provider) {
      throw new AppError(
        'Provider is required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    const integration =
      await CalendarIntegration.findOne({
        userId,
        provider,
      });

    if (!integration) {
      throw new AppError(
        'Calendar integration not found.',
        404,
        'CALENDAR_NOT_FOUND'
      );
    }

    integration.isConnected = false;

    await integration.save();

    sendSuccess(res, {
      message: 'Calendar disconnected successfully.',
    });
  } catch (err) {
    next(err);
  }
};