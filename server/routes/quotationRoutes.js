import express from 'express';
import { createQuotation, getQuotations, getQuotationById, approveRejectQuotation, convertToPO } from '../controllers/quotationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

router.post('/', protect, authorize(UserRole.USER, UserRole.ADMIN), createQuotation);
router.get('/', protect, getQuotations);
router.get('/:id', protect, getQuotationById);
router.put('/:id/approve-reject', protect, authorize(UserRole.MANAGER, UserRole.ADMIN), approveRejectQuotation);
router.post('/:id/convert-to-po', protect, authorize(UserRole.MANAGER, UserRole.ADMIN), convertToPO);

export default router;