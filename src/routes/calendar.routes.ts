import { Router } from 'express';

import {
  connectCalendar,
  getCalendarIntegration,
  updateCalendarIntegration,
  disconnectCalendar,
} from '../controllers/calendar.controller';

import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, connectCalendar);

router.get('/', protect, getCalendarIntegration);

router.patch('/', protect, updateCalendarIntegration);

router.delete('/', protect, disconnectCalendar);

export default router;