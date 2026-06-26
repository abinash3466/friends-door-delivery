const { getDistanceKm } = require('./geoFence');

// Standard route distance matrix in KM as specified
const ROUTE_DISTANCES = {
  'ambasamudram-papanasam': 8,
  'ambasamudram-vikramasingapuram': 5,
  'ambasamudram-alwarkurichi': 14,
  'papanasam-alwarkurichi': 16,
  'vikramasingapuram-alwarkurichi': 11,
};

/**
 * Normalizes route keys to ensure consistent lookup regardless of direction
 */
const getRouteKey = (loc1, loc2) => {
  const normalized1 = loc1.toLowerCase().trim();
  const normalized2 = loc2.toLowerCase().trim();
  return [normalized1, normalized2].sort().join('-');
};

/**
 * Returns the distance in kilometers between two locations.
 * Looks up in route matrix first, falls back to coordinates calculation if coordinates are provided.
 */
const getRouteDistance = (loc1, loc2, coord1 = null, coord2 = null) => {
  const key = getRouteKey(loc1, loc2);
  
  if (ROUTE_DISTANCES[key]) {
    return ROUTE_DISTANCES[key];
  }
  
  // Return reversed key lookup just in case
  const reversedKey = getRouteKey(loc2, loc1);
  if (ROUTE_DISTANCES[reversedKey]) {
    return ROUTE_DISTANCES[reversedKey];
  }

  // Fallback to coordinates-based distance
  if (coord1 && coord2 && coord1.latitude && coord1.longitude && coord2.latitude && coord2.longitude) {
    return getDistanceKm(coord1.latitude, coord1.longitude, coord2.latitude, coord2.longitude);
  }

  // If no match and no coordinates, return a sensible default or compute an approximate distance
  return 10; // Default fallback distance in km
};

module.exports = {
  getRouteDistance,
  ROUTE_DISTANCES,
};
