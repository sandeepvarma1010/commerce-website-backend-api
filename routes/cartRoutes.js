const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Get cart for a user
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product to cart
router.post('/:userId', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.params.userId });
    const product = await Product.findById(productId);

    if (!cart) {
      cart = new Cart({
        userId: req.params.userId,
        products: [{ productId, quantity }],
        totalPrice: product.price * quantity
      });
    } else {
      const existingProduct = cart.products.find(p => p.productId.toString() === productId);
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
      cart.totalPrice += product.price * quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove product from cart
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const productIndex = cart.products.findIndex(p => p.productId.toString() === req.params.productId);
    if (productIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });

    const product = await Product.findById(req.params.productId);
    cart.totalPrice -= product.price * cart.products[productIndex].quantity;
    cart.products.splice(productIndex, 1);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;