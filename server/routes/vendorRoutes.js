import express from 'express';
import { createVendor, getVendors, getVendorById, updateVendor, deleteVendor } from '../controllers/vendorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

router.post('/', protect, authorize(UserRole.USER, UserRole.ADMIN), createVendor);
router.get('/', protect, getVendors);
router.get('/:id', protect, getVendorById);
router.put('/:id', protect, authorize(UserRole.ADMIN), updateVendor);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteVendor);

export default router;