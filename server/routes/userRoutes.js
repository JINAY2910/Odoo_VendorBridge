import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), getUsers);
router.post('/', protect, authorize('ADMIN'), createUser);
router.put('/:id', protect, authorize('ADMIN'), updateUser);
router.delete('/:id', protect, authorize('ADMIN'), deleteUser);

export default router;
