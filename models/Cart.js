const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, // Ensure it's an ObjectId
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId, // Ensure this is also an ObjectId
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model('Cart', CartSchema);