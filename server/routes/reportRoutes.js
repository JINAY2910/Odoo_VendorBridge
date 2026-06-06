import express from 'express';
import { getGeneralStats, getMonthlyTrends, getVendorSpending } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

router.get('/stats', protect, authorize(UserRole.MANAGER, UserRole.ADMIN), getGeneralStats);
router.get('/trends', protect, authorize(UserRole.MANAGER, UserRole.ADMIN), getMonthlyTrends);
router.get('/spending', protect, authorize(UserRole.MANAGER, UserRole.ADMIN), getVendorSpending);

export default router;