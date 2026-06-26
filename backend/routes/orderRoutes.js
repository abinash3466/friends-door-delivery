const express = require('express');
const router = express.Router();
const { createOrder, getCustomerOrders, getOrderDetails, payOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validateGeoFence } = require('../middleware/geoFenceMiddleware');

// Placing orders and listings
router.post('/', protect, authorizeRoles('CUSTOMER'), validateGeoFence, createOrder);
router.get('/my-orders', protect, authorizeRoles('CUSTOMER'), getCustomerOrders);
router.get('/:id', protect, getOrderDetails);
router.post('/:id/pay', protect, authorizeRoles('CUSTOMER'), payOrder);

module.exports = router;
