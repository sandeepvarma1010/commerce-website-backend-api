const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Get cart for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Use `userId` consistently to query the Cart
        const cart = await Cart.findOne({ userId }).populate('products.productId');

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        res.json({
            products: cart.products,
            totalPrice: cart.totalPrice
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});
 // Add product to cart
 router.post('/:userId', async (req, res) => {
   const { productId, quantity } = req.body;
   try {
     let cart = await Cart.findOne({ userId: req.params.userId });
     const product = await Product.findById(productId);

     if (!product) {
       return res.status(404).json({ message: 'Product not found' });
     }

     if (!cart) {
       // Create new cart for this user
       cart = new Cart({
         userId: req.params.userId,
         products: [{ productId, quantity }],
         totalPrice: product.price * quantity
       });
     } else {
       // Check if the product already exists in the cart
       const existingProduct = cart.products.find(p => p.productId.toString() === productId);
       if (existingProduct) {
         existingProduct.quantity += quantity; // Increase quantity if it exists
       } else {
         cart.products.push({ productId, quantity }); // Add new product to cart
       }
       cart.totalPrice += product.price * quantity;
     }

     await cart.save();
     res.json(cart);
   } catch (err) {
     console.error('Error adding product to cart:', err.message);
     res.status(500).json({ message: 'Server error', error: err.message });
   }
 });

// Remove or reduce product quantity in cart
router.put('/:userId/:productId', async (req, res) => {
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const productIndex = cart.products.findIndex(p => p.productId.toString() === req.params.productId);
    if (productIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });

    const product = await Product.findById(req.params.productId);

    // Remove the product if quantity to remove is greater or equal to what's in the cart
    if (cart.products[productIndex].quantity <= quantity) {
      cart.totalPrice -= product.price * cart.products[productIndex].quantity;
      cart.products.splice(productIndex, 1); // Remove the product entirely
    } else {
      cart.products[productIndex].quantity -= quantity;
      cart.totalPrice -= product.price * quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove product from cart (complete removal of product)
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const productIndex = cart.products.findIndex(p => p.productId.toString() === req.params.productId);
    if (productIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });

    const product = await Product.findById(req.params.productId);
    cart.totalPrice -= product.price * cart.products[productIndex].quantity;
    cart.products.splice(productIndex, 1); // Remove the product entirely

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;