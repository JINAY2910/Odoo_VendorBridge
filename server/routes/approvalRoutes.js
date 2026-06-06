import express from 'express';
import { getApprovalLogs } from '../controllers/approvalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:entityType/:entityId', protect, getApprovalLogs);

export default router;
