import express from 'express';
import { recordPayment, getPayments, getPaymentsByInvoice } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

router.post('/', protect, authorize(UserRole.ADMIN, UserRole.MANAGER), recordPayment);
router.get('/', protect, getPayments);
router.get('/invoice/:invoiceId', protect, getPaymentsByInvoice);

export default router;