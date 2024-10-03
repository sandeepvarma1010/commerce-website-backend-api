const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const router = express.Router();

// Helper function to validate inputs
const validateProductInput = (name, price, category) => {
  if (!name || !price || isNaN(price) || !category) {
    return false;
  }
  return true;
};

// Public route: Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Search products by category
router.get('/category', async (req, res) => {
  const category = req.query.category; // Access the query parameter "category"
  try {
    const products = await Product.find({ category });
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).json({ message: 'No products found for this category' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by category', error: error.message });
  }
});

// Admin routes (only admin can create, update, and delete)
router.post('/', protect, admin, async (req, res) => {
  const { name, price, description, category, imageUrl } = req.body;

  // Validate input
  if (!validateProductInput(name, price, category)) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const product = new Product({ name, price, description, category, imageUrl });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  const { name, price, description, category, imageUrl } = req.body;

  // Validate input
  if (!validateProductInput(name, price, category)) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name;
      product.price = price;
      product.description = description;
      product.category = category;
      product.imageUrl = imageUrl;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete a product - Admin only
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne(); // Change from `remove()` to `deleteOne()`
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;