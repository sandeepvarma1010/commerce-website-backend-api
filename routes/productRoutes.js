const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all products with optional filtering by keyword or category
router.get('/', async (req, res) => {
  const { keyword, category } = req.query;

  // Initialize the filter object
  let filter = {};

  // Add keyword filter if it's provided
  if (keyword) {
    filter.name = { $regex: keyword, $options: 'i' }; // 'i' for case-insensitive search
  }

  // Add category filter if it's provided
  if (category) {
    filter.category = category;
  }

  try {
    // Fetch products based on the filter
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new product (admin feature)
router.post('/', async (req, res) => {
  const { name, description, price, imageUrl, category } = req.body;

  const product = new Product({
    name,
    description,
    price,
    imageUrl,
    category, // Added category to the product model
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

// Update the product fields
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.imageUrl = req.body.imageUrl || product.imageUrl;
    product.category = req.body.category || product.category;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;