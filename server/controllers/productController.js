import { Product, User } from '../models/index.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [
        { model: User, as: 'creator', attributes: ['name'] }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, code, codeType, gstRate, defaultPrice } = req.body;

    const product = await Product.create({
      name,
      code,
      codeType,
      gstRate,
      defaultPrice,
      createdBy: req.user._id
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};