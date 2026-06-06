import express from 'express';
import { getActivityLogs, getActivityLogCount } from '../controllers/activityLogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/count', protect, getActivityLogCount);
router.get('/', protect, getActivityLogs);

export default router;

