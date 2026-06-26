const express = require('express');
const router = express.Router();
const { estimateFare, bookRide, getCustomerRides, getRideDetails } = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validateGeoFence } = require('../middleware/geoFenceMiddleware');

router.post('/estimate', protect, authorizeRoles('CUSTOMER'), estimateFare);
router.post('/', protect, authorizeRoles('CUSTOMER'), validateGeoFence, bookRide);
router.get('/my-rides', protect, authorizeRoles('CUSTOMER'), getCustomerRides);
router.get('/:id', protect, getRideDetails);

module.exports = router;
