import { Router } from 'express';

import {
  getAuditLogs,
  getAuditLogById,
} from '../controllers/auditLog.controller';

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
  getAuditLogs
);

router.get(
  '/:id',
  protect,
  authorize('super_admin', 'space_admin'),
  getAuditLogById
);

export default router;