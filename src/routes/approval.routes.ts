import { Router } from 'express';

import {
  getApprovals,
  getApprovalById,
  approveBooking,
  rejectBooking,
} from '../controllers/approval.controller';

import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

/**
 * Super Admin / Space Admin
 */
router.get(
  '/',
  protect,
  authorize('super_admin', 'space_admin'),
  getApprovals
);

router.get(
  '/:id',
  protect,
  authorize('super_admin', 'space_admin'),
  getApprovalById
);

router.patch(
  '/:bookingId/approve',
  protect,
  authorize('super_admin', 'space_admin'),
  approveBooking
);

router.patch(
  '/:bookingId/reject',
  protect,
  authorize('super_admin', 'space_admin'),
  rejectBooking
);

export default router;