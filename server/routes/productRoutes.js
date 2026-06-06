import express from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProducts);
router.post('/', createProduct);

export default router;
