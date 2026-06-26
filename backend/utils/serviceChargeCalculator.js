/**
 * Calculates delivery charge, service fee, and final invoice amounts.
 * 
 * @param {number} billAmount - The actual purchase bill amount from the store.
 * @param {number} distanceKm - Optional distance from store to customer.
 * @returns {object} Breakdown of charges.
 */
const calculateOrderInvoice = (billAmount, distanceKm = 0) => {
  const parsedBillAmount = parseFloat(billAmount) || 0;
  
  // Delivery Charge: Base ₹30 + ₹8 per KM beyond 3KM, or minimum ₹35
  const baseDelivery = 35;
  const perKmRate = 8;
  const freeKm = 3;
  
  let deliveryCharge = baseDelivery;
  if (distanceKm > freeKm) {
    deliveryCharge += Math.round((distanceKm - freeKm) * perKmRate);
  }
  
  // Service Charge: 5% of bill amount, minimum ₹15, maximum ₹150
  let serviceCharge = Math.round(parsedBillAmount * 0.05);
  if (serviceCharge < 15) {
    serviceCharge = 15;
  } else if (serviceCharge > 150) {
    serviceCharge = 150;
  }
  
  const grandTotal = parsedBillAmount + deliveryCharge + serviceCharge;
  
  return {
    billAmount: parsedBillAmount,
    deliveryCharge,
    serviceCharge,
    grandTotal,
  };
};

module.exports = {
  calculateOrderInvoice,
};
