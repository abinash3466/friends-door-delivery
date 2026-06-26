const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    verifyOwnerOtp,
    getMe,
    updateLocation
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateGeoFence } = require('../middleware/geoFenceMiddleware');

router.post('/register', validateGeoFence, registerUser);
router.post('/login', loginUser);
router.post('/verify-owner-otp', verifyOwnerOtp);
router.get('/me', protect, getMe);
router.put('/location', protect, validateGeoFence, updateLocation);

module.exports = router;
