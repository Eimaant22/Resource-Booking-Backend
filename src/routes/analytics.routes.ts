import { Router } from 'express';

import {
  getDashboardAnalytics,
} from '../controllers/analytics.controller';

import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
const router = Router();

router.get(
  '/dashboard',
  protect,
  authorize('super_admin', 'space_admin'),
  getDashboardAnalytics
);

export default router;