import { Router } from 'express';

import {
  createNotification,
  getMyNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notification.controller';

import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

/**
 * Logged-in User
 */
router.get(
  '/',
  protect,
  getMyNotifications
);

router.get(
  '/:id',
  protect,
  getNotificationById
);

router.patch(
  '/:id/read',
  protect,
  markNotificationAsRead
);

router.patch(
  '/read-all',
  protect,
  markAllNotificationsAsRead
);

router.delete(
  '/:id',
  protect,
  deleteNotification
);

/**
 * Admin
 */
router.post(
  '/',
  protect,
  authorize('super_admin', 'space_admin'),
  createNotification
);

export default router;