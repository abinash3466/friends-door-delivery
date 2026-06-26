const Ride = require('../models/Ride');
const Notification = require('../models/Notification');
const { getRouteDistance } = require('../utils/routeMatrix');
const { calculateBikeTaxiFare } = require('../utils/fareCalculator');

/**
 * @desc    Get fare estimation for a bike taxi ride
 * @route   POST /api/rides/estimate
 * @access  Private (CUSTOMER)
 */
const estimateFare = async (req, res, next) => {
  try {
    const {
      pickupLocation,
      destinationLocation,
      pickupCoordinates,
      destinationCoordinates,
      surgeMultiplier,
    } = req.body;

    if (!pickupLocation || !destinationLocation) {
      res.status(400);
      throw new Error('Please provide both pickup and destination locations');
    }

    const distance = getRouteDistance(
      pickupLocation,
      destinationLocation,
      pickupCoordinates,
      destinationCoordinates
    );

    // Dynamic Peak Hour Surge calculation mock (e.g. between 6pm-9pm surge is 1.5x)
    let dynamicSurge = parseFloat(surgeMultiplier) || 1.0;
    const currentHour = new Date().getHours();
    if (!surgeMultiplier && (currentHour >= 18 && currentHour <= 21)) {
      dynamicSurge = 1.5; // Peak surge 1.5x
    }

    const fareBreakdown = calculateBikeTaxiFare(distance, dynamicSurge);

    res.json({
      success: true,
      pickupLocation,
      destinationLocation,
      distanceKm: distance,
      fareBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book a new bike taxi ride
 * @route   POST /api/rides
 * @access  Private (CUSTOMER)
 */
const bookRide = async (req, res, next) => {
  try {
    const {
      pickupLocation,
      destinationLocation,
      pickupCoordinates,
      destinationCoordinates,
      paymentMethod,
    } = req.body;

    if (
      !pickupLocation ||
      !destinationLocation ||
      !pickupCoordinates ||
      !destinationCoordinates
    ) {
      res.status(400);
      throw new Error('Missing required ride booking details');
    }

    const distance = getRouteDistance(
      pickupLocation,
      destinationLocation,
      pickupCoordinates,
      destinationCoordinates
    );

    // Peak surge checks (e.g. 6PM - 9PM)
    let surgeMultiplier = 1.0;
    const currentHour = new Date().getHours();
    if (currentHour >= 18 && currentHour <= 21) {
      surgeMultiplier = 1.5;
    }

    const fareBreakdown = calculateBikeTaxiFare(distance, surgeMultiplier);

    const ride = await Ride.create({
      customer: req.user._id,
      pickupLocation,
      pickupCoordinates,
      destinationLocation,
      destinationCoordinates,
      distanceKm: distance,
      baseFare: fareBreakdown.baseFare,
      distanceFare: fareBreakdown.distanceFare,
      surgeMultiplier,
      surgeAmount: fareBreakdown.surgeAmount,
      finalFare: fareBreakdown.finalFare,
      status: 'REQUESTED',
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: 'PENDING',
    });

    // Notify Customer
    await Notification.create({
      user: req.user._id,
      title: 'Bike Ride Booked',
      message: `Your ride request from ${pickupLocation} to ${destinationLocation} is pending worker assignment. Estimated fare: ₹${fareBreakdown.finalFare}.`,
      type: 'RIDE_STATUS',
    });

    res.status(201).json({
      success: true,
      message: 'Bike ride request submitted successfully',
      ride,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer's rides
 * @route   GET /api/rides/my-rides
 * @access  Private (CUSTOMER)
 */
const getCustomerRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ customer: req.user._id })
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name phone' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rides.length, rides });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ride details
 * @route   GET /api/rides/:id
 * @access  Private
 */
const getRideDetails = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name phone' },
      });

    if (!ride) {
      res.status(404);
      throw new Error('Ride not found');
    }

    const isOwner = req.user.role === 'OWNER';
    const isCustomerOwner = ride.customer._id.toString() === req.user._id.toString();
    const isAssignedWorker = ride.worker && ride.worker.user.toString() === req.user._id.toString();

    if (!isOwner && !isCustomerOwner && !isAssignedWorker) {
      res.status(403);
      throw new Error('Not authorized to view this ride details');
    }

    res.json({ success: true, ride });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  estimateFare,
  bookRide,
  getCustomerRides,
  getRideDetails,
};
