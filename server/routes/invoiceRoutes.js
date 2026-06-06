import express from 'express';
import { createInvoice, getInvoices, getInvoiceById } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

router.post('/', protect, authorize(UserRole.USER, UserRole.ADMIN), createInvoice);
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoiceById);

export default router;