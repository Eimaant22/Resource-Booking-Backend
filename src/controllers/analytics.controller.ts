import { Response, NextFunction } from 'express';

import Booking from '../models/Booking';
import Resource from '../models/Resource';
import User from '../models/User';
import Organization from '../models/Organization';
import Approval from '../models/Approval';

import { AuthRequest } from '../middleware/auth';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';

/**
 * GET /api/analytics/dashboard
 * Super Admin / Space Admin
 */
export const getDashboardAnalytics = async (
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

    let userFilter = {};
    let resourceFilter = {};
    let bookingFilter = {};

    if (
      user.role === 'space_admin' &&
      user.organizationId
    ) {
      userFilter = {
        organizationId: user.organizationId,
      };

      resourceFilter = {
        organizationId: user.organizationId,
      };

      const resources = await Resource.find({
        organizationId: user.organizationId,
      }).select('_id');

      bookingFilter = {
        resourceId: {
          $in: resources.map((r) => r._id),
        },
      };
    }

    const [
      totalOrganizations,
      totalUsers,
      totalResources,
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      completedBookings,
      totalApprovals,
      pendingApprovals,
    ] = await Promise.all([

      Organization.countDocuments(),

      User.countDocuments(userFilter),

      Resource.countDocuments(resourceFilter),

      Booking.countDocuments(bookingFilter),

      Booking.countDocuments({
        ...bookingFilter,
        status: 'pending',
      }),

      Booking.countDocuments({
        ...bookingFilter,
        status: 'approved',
      }),

      Booking.countDocuments({
        ...bookingFilter,
        status: 'rejected',
      }),

      Booking.countDocuments({
        ...bookingFilter,
        status: 'completed',
      }),

      Approval.countDocuments(),

      Approval.countDocuments({
        status: 'pending',
      }),
    ]);

    sendSuccess(res, {
      analytics: {
        totalOrganizations,
        totalUsers,
        totalResources,
        totalBookings,

        pendingBookings,
        approvedBookings,
        rejectedBookings,
        completedBookings,

        totalApprovals,
        pendingApprovals,
      },
    });

  } catch (err) {
    next(err);
  }
};