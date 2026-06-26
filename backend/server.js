require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rideRoutes = require('./routes/rideRoutes');
const workerRoutes = require('./routes/workerRoutes');

// Models for seeding
const User = require('./models/User');
const Store = require('./models/Store');

const app = express();

// Connect Database
connectDB().then(() => {
  // Seed initial data if DB is empty
  seedDatabase();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/worker', workerRoutes);

// Base Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Friends Door Delivery & Rapido Service API' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Database Seeder
async function seedDatabase() {
  try {
    // 1. Check & Seed Default Admin/Owner
    const adminCount = await User.countDocuments({ role: 'OWNER' });
    if (adminCount === 0) {
      console.log('Seeding default Owner account...');
      await User.create({
        name: 'Friends Owner',
        email: 'owner@friends.com',
        password: 'password123',
        phone: '9876543210',
        role: 'OWNER',
        coordinates: { latitude: 8.7061, longitude: 77.4578 },
      });
      console.log('Owner account created successfully (owner@friends.com / password123)');
    }

    // 2. Check & Seed Default Workers for testing
    const workerCount = await User.countDocuments({ role: 'WORKER' });
    if (workerCount === 0) {
      console.log('Seeding default Worker account...');
      const workerUser = await User.create({
        name: 'Ramesh Rider',
        email: 'worker@friends.com',
        password: 'password123',
        phone: '9876543211',
        role: 'WORKER',
        coordinates: { latitude: 8.7061, longitude: 77.4578 },
      });

      const Worker = require('./models/Worker');
      await Worker.create({
        user: workerUser._id,
        vehicleNumber: 'TN-72-Z-9999',
        vehicleType: 'BIKE',
        status: 'AVAILABLE',
        currentCoordinates: { latitude: 8.7061, longitude: 77.4578 },
      });
      console.log('Worker account created successfully (worker@friends.com / password123)');
    }

    // 3. Check & Seed Default Customer
    const customerCount = await User.countDocuments({ role: 'CUSTOMER' });
    if (customerCount === 0) {
      console.log('Seeding default Customer account...');
      await User.create({
        name: 'Muthu Customer',
        email: 'customer@friends.com',
        password: 'password123',
        phone: '9876543212',
        role: 'CUSTOMER',
        coordinates: { latitude: 8.7061, longitude: 77.4578 },
      });
      console.log('Customer account created successfully (customer@friends.com / password123)');
    }

    // 4. Check & Seed Stores
    const storeCount = await Store.countDocuments();
    if (storeCount === 0) {
      console.log('Seeding default operational stores in Ambasamudram service zone...');
      await Store.create([
        {
          name: 'Ambasamudram Spicy Restaurant',
          type: 'Restaurant',
          locationName: 'Ambasamudram',
          coordinates: { latitude: 8.7061, longitude: 77.4578 },
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
          isActive: true,
          items: [
            { name: 'Kothu Parotta', price: 120, description: 'Traditional Tamil Nadu spicy minced parotta with chicken salna', category: 'Dinner' },
            { name: 'Chicken Biryani', price: 180, description: 'Authentic Seeraga samba chicken biryani', category: 'Lunch' },
            { name: 'Mutton Chukka', price: 220, description: 'Dry spicy mutton roast with local spices', category: 'Sides' },
            { name: 'Onion Uthappam', price: 80, description: 'Soft rice pancake topped with onions', category: 'Breakfast' },
          ],
        },
        {
          name: 'Nadar Grocery Mart',
          type: 'Grocery',
          locationName: 'Vikramasingapuram',
          coordinates: { latitude: 8.7000, longitude: 77.4000 },
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
          isActive: true,
          items: [
            { name: 'Aashirvaad Shudh Chakki Atta 5kg', price: 290, description: '100% whole wheat flour', category: 'Atta & Flours' },
            { name: 'Ponni Rice 5kg', price: 340, description: 'Premium boiled ponni rice', category: 'Rice & Grains' },
            { name: 'Gold Winner Sunflower Oil 1L', price: 135, description: 'Refined sunflower oil', category: 'Oils & Ghee' },
            { name: 'Tata Salt 1kg', price: 28, description: 'Iodized salt', category: 'Spices & Salt' },
          ],
        },
        {
          name: 'Papanasam Pharmacy',
          type: 'Pharmacy',
          locationName: 'Papanasam',
          coordinates: { latitude: 8.6833, longitude: 77.3667 },
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
          isActive: true,
          items: [
            { name: 'Paracetamol 650mg x10', price: 30, description: 'Pain and fever relief tablets', category: 'General' },
            { name: 'Vicks Vaporub 50g', price: 165, description: 'Cough and cold relief balm', category: 'OTC' },
            { name: 'Dettol Liquid Antiseptic 250ml', price: 140, description: 'Antiseptic disinfectant liquid', category: 'First Aid' },
          ],
        },
      ]);
      console.log('Stores seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
