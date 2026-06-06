import express from 'express';
import { createRFQ, getRFQs, getRFQById, updateRFQ } from '../controllers/rfqController.js';
import { getQuotationsByRFQ } from '../controllers/quotationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRFQ);
router.get('/', protect, getRFQs);
router.get('/:id', protect, getRFQById);
router.put('/:id', protect, updateRFQ);
router.get('/:rfqId/quotations', protect, getQuotationsByRFQ);

export default router;
