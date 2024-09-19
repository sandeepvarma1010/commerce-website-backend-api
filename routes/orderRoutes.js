const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const router = express.Router();

// Place an order
router.post('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const order = new Order({
      userId: cart.userId,
      products: cart.products,
      totalPrice: cart.totalPrice,
      paymentStatus: 'pending'
    });

    await order.save();
    await Cart.findByIdAndDelete(cart._id); // Clear the cart after placing the order
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders for a user
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;