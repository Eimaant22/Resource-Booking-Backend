import { Router } from 'express';

import {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from '../controllers/user.controller';

import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

/**
 * Logged-in User
 */
router.get(
  '/profile',
  protect,
  getProfile
);

router.patch(
  '/profile',
  protect,
  updateProfile
);

/**
 * User Management
 */
router.get(
  '/',
  protect,
  authorize('super_admin', 'space_admin'),
  getUsers
);

router.get(
  '/:id',
  protect,
  authorize('super_admin', 'space_admin'),
  getUserById
);

router.patch(
  '/:id/role',
  protect,
  authorize('super_admin'),
  updateUserRole
);

router.patch(
  '/:id/status',
  protect,
  authorize('super_admin', 'space_admin'),
  updateUserStatus
);

router.delete(
  '/:id',
  protect,
  authorize('super_admin'),
  deleteUser
);

export default router;