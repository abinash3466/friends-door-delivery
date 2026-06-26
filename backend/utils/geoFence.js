// Geofence configuration for operational regions in Tamil Nadu, India
const OPERATIONAL_HUBS = [
  { name: 'Ambasamudram', latitude: 8.7061, longitude: 77.4578, radiusKm: 12 },
  { name: 'Papanasam', latitude: 8.6833, longitude: 77.3667, radiusKm: 10 },
  { name: 'Vikramasingapuram', latitude: 8.7000, longitude: 77.4000, radiusKm: 10 },
  { name: 'Alwarkurichi', latitude: 8.7833, longitude: 77.3833, radiusKm: 12 },
];

/**
 * Calculates the distance between two GPS coordinates using the Haversine formula.
 */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

/**
 * Validates whether a given set of coordinates is within the allowed geofenced operational region.
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
const isWithinServiceZone = (latitude, longitude) => {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    return false;
  }
  
  // Return true if the location falls within the service radius of any operational hub
  for (const hub of OPERATIONAL_HUBS) {
    const distance = getDistanceKm(latitude, longitude, hub.latitude, hub.longitude);
    if (distance <= hub.radiusKm) {
      return true;
    }
  }
  return false;
};

module.exports = {
  isWithinServiceZone,
  getDistanceKm,
  OPERATIONAL_HUBS,
};
