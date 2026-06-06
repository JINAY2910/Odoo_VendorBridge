import express from 'express';
import { getPOs, getPOById, approveRejectPO, createPO } from '../controllers/poController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

router.post('/', protect, authorize(UserRole.USER, UserRole.ADMIN), createPO);
router.get('/', protect, getPOs);
router.get('/:id', protect, getPOById);
router.put('/:id/approve-reject', protect, authorize(UserRole.MANAGER, UserRole.ADMIN), approveRejectPO);

export default router;