import express from 'express';
import { createInvoice, getInvoices, getInvoiceById, sendInvoiceEmailController } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

router.post('/', protect, authorize(UserRole.USER, UserRole.ADMIN), createInvoice);
router.get('/', protect, getInvoices);
router.post('/:id/send-email', protect, sendInvoiceEmailController);
router.get('/:id', protect, getInvoiceById);

export default router;