import { Router } from 'express';

import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  checkInBooking
} from '../controllers/booking.controller';

import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

/**
 * Any authenticated user
 */
router.post(
  '/',
  protect,
  createBooking
);

router.get(
  '/',
  protect,
  getBookings
);

router.get(
  '/:id',
  protect,
  getBookingById
);

router.patch(
  '/:id',
  protect,
  updateBooking
);

/**
 * Admins
 */
router.patch(
  '/:id/status',
  protect,
  authorize('super_admin', 'space_admin'),
  updateBookingStatus
);

/**
 * Booking Owner / Super Admin
 */
router.delete(
  '/:id',
  protect,
  cancelBooking
);
router.patch('/:id/check-in', protect, checkInBooking);

export default router;