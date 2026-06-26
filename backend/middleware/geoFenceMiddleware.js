const { isWithinServiceZone } = require('../utils/geoFence');

/**
 * Middleware to validate coordinates in requests.
 * Rejects requests if coordinates fall outside the configured geofenced service zones.
 */
const validateGeoFence = (req, res, next) => {
  const coordinatesToCheck = [];

  // 1. Check for standard Store/User coordinate structures
  if (req.body.coordinates) {
    coordinatesToCheck.push(req.body.coordinates);
  }

  // 2. Check for Order delivery coordinates
  if (req.body.deliveryCoordinates) {
    coordinatesToCheck.push(req.body.deliveryCoordinates);
  }

  // 3. Check for Worker location updates
  if (req.body.currentCoordinates) {
    coordinatesToCheck.push(req.body.currentCoordinates);
  }

  // 4. Check for Bike Ride pickup and destination coordinates
  if (req.body.pickupCoordinates) {
    coordinatesToCheck.push(req.body.pickupCoordinates);
  }
  if (req.body.destinationCoordinates) {
    coordinatesToCheck.push(req.body.destinationCoordinates);
  }

  // Check inline latitude/longitude pairs
  if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
    coordinatesToCheck.push({ latitude: req.body.latitude, longitude: req.body.longitude });
  }

  // Validate each identified coordinate set
  for (const coords of coordinatesToCheck) {
    const lat = parseFloat(coords.latitude);
    const lng = parseFloat(coords.longitude);

    if (isNaN(lat) || isNaN(lng) || !isWithinServiceZone(lat, lng)) {
      return res.status(400).json({
        success: false,
        message: 'Service unavailable outside Friends Door Delivery service zone.',
      });
    }
  }

  next();
};

module.exports = { validateGeoFence };
