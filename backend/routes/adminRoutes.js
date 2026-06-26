const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStores,
  createStore,
  updateStore,
  deleteStore,
  getWorkersList,
  reassignOrder,
  settleWorkerPayout,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validateGeoFence } = require('../middleware/geoFenceMiddleware');

// All routes are protected and restricted to OWNER
router.use(protect);
router.use(authorizeRoles('OWNER'));

router.get('/analytics', getDashboardStats);
router.get('/stores', getStores);
router.post('/stores', validateGeoFence, createStore);
router.put('/stores/:id', validateGeoFence, updateStore);
router.delete('/stores/:id', deleteStore);
router.get('/workers', getWorkersList);
router.put('/reassign', reassignOrder);
router.post('/workers/:id/payout', settleWorkerPayout);

module.exports = router;
