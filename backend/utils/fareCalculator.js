/**
 * Calculates the bike taxi ride fare.
 * Formula: Final Fare = Base Fare + (Distance * Per KM Rate) + Surge Pricing
 * 
 * @param {number} distanceKm - The distance in kilometers.
 * @param {number} surgeMultiplier - The surge multiplier (e.g. 1.0, 1.2, 1.5).
 * @returns {object} Detailed breakdown of the fare.
 */
const calculateBikeTaxiFare = (distanceKm, surgeMultiplier = 1.0) => {
  const BASE_FARE = 25; // ₹25
  const PER_KM_RATE = 12; // ₹12 / KM
  
  const rawDistanceFare = distanceKm * PER_KM_RATE;
  const basePlusDistance = BASE_FARE + rawDistanceFare;
  const finalFare = Math.round(basePlusDistance * surgeMultiplier);
  const surgeAmount = finalFare - basePlusDistance;

  return {
    baseFare: BASE_FARE,
    perKmRate: PER_KM_RATE,
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    distanceFare: parseFloat(rawDistanceFare.toFixed(2)),
    surgeMultiplier,
    surgeAmount: parseFloat(surgeAmount.toFixed(2)),
    finalFare: Math.max(finalFare, BASE_FARE), // Cannot be lower than base fare
  };
};

module.exports = {
  calculateBikeTaxiFare,
};
