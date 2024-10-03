const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { protect, admin } = require('./middleware/authMiddleware');
const cors = require('cors');

dotenv.config();

const app = express();


app.use(cors({
  origin: 'http://localhost:3001', // Allow only your frontend origin
  credentials: true, // Allow credentials to be sent
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Protect and Admin routes for products
app.use('/api/products', productRoutes);

// Auth routes for user registration and login
app.use('/api/auth', authRoutes);

// Cart and order routes
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection failed:', err));

const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
    console.log(`Server running on port ${PORT}`);
});

