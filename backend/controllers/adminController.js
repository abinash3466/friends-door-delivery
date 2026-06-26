const Order = require('../models/Order');
const Ride = require('../models/Ride');
const Store = require('../models/Store');
const Worker = require('../models/Worker');
const User = require('../models/User');

/**
 * @desc    Get Owner dashboard analytics
 * @route   GET /api/admin/analytics
 * @access  Private (OWNER)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Order analytics (completed)
    const completedOrders = await Order.find({ status: 'COMPLETED' });
    const totalOrderRevenue = completedOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    const totalOrdersCount = await Order.countDocuments();

    // 2. Ride analytics (completed)
    const completedRides = await Ride.find({ status: 'COMPLETED' });
    const totalRideRevenue = completedRides.reduce((sum, ride) => sum + (ride.finalFare || 0), 0);
    const totalRidesCount = await Ride.countDocuments();

    // 3. Overall Totals
    const totalRevenue = totalOrderRevenue + totalRideRevenue;

    // 4. Daily, Weekly, Monthly revenue breakdowns
    // Today
    const todayOrders = await Order.find({ status: 'COMPLETED', updatedAt: { $gte: today } });
    const todayRides = await Ride.find({ status: 'COMPLETED', updatedAt: { $gte: today } });
    const dailyRevenue = 
      todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) +
      todayRides.reduce((sum, r) => sum + (r.finalFare || 0), 0);

    // Weekly
    const weeklyOrders = await Order.find({ status: 'COMPLETED', updatedAt: { $gte: sevenDaysAgo } });
    const weeklyRides = await Ride.find({ status: 'COMPLETED', updatedAt: { $gte: sevenDaysAgo } });
    const weeklyRevenue = 
      weeklyOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) +
      weeklyRides.reduce((sum, r) => sum + (r.finalFare || 0), 0);

    // Monthly
    const monthlyOrders = await Order.find({ status: 'COMPLETED', updatedAt: { $gte: thirtyDaysAgo } });
    const monthlyRides = await Ride.find({ status: 'COMPLETED', updatedAt: { $gte: thirtyDaysAgo } });
    const monthlyRevenue = 
      monthlyOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) +
      monthlyRides.reduce((sum, r) => sum + (r.finalFare || 0), 0);

    // 5. Worker performance ranking
    const workers = await Worker.find().populate('user', 'name phone');
    const workerPerformance = await Promise.all(
      workers.map(async (worker) => {
        const jobsCompleted = await Order.countDocuments({ worker: worker._id, status: 'COMPLETED' }) +
                              await Ride.countDocuments({ worker: worker._id, status: 'COMPLETED' });
        return {
          workerId: worker._id,
          name: worker.user ? worker.user.name : 'Unknown Worker',
          phone: worker.user ? worker.user.phone : '',
          rating: worker.rating,
          status: worker.status,
          vehicleNumber: worker.vehicleNumber,
          earningsMonthly: worker.earningsMonthly,
          jobsCompleted,
        };
      })
    );

    // Sort by jobs completed descending
    workerPerformance.sort((a, b) => b.jobsCompleted - a.jobsCompleted);

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        totalDeliveries: completedOrders.length,
        totalBikeTrips: completedRides.length,
        dailyRevenue,
        weeklyRevenue,
        monthlyRevenue,
      },
      workerPerformance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all stores
 * @route   GET /api/admin/stores
 * @access  Private (OWNER)
 */
const getStores = async (req, res, next) => {
  try {
    const stores = await Store.find();
    res.json({ success: true, count: stores.length, stores });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a store
 * @route   POST /api/admin/stores
 * @access  Private (OWNER)
 */
const createStore = async (req, res, next) => {
  try {
    const { name, type, locationName, coordinates, image, items } = req.body;

    const store = await Store.create({
      name,
      type,
      locationName,
      coordinates,
      image,
      items: items || [],
    });

    res.status(201).json({ success: true, store });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit a store
 * @route   PUT /api/admin/stores/:id
 * @access  Private (OWNER)
 */
const updateStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!store) {
      res.status(404);
      throw new Error('Store not found');
    }

    res.json({ success: true, store });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete store
 * @route   DELETE /api/admin/stores/:id
 * @access  Private (OWNER)
 */
const deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);

    if (!store) {
      res.status(404);
      throw new Error('Store not found');
    }

    res.json({ success: true, message: 'Store removed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all workers list
 * @route   GET /api/admin/workers
 * @access  Private (OWNER)
 */
const getWorkersList = async (req, res, next) => {
  try {
    const workers = await Worker.find().populate('user', 'name email phone isActive');
    res.json({ success: true, count: workers.length, workers });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reassign an order to another worker
 * @route   PUT /api/admin/reassign
 * @access  Private (OWNER)
 */
const reassignOrder = async (req, res, next) => {
  try {
    const { orderId, rideId, workerId } = req.body;

    if (!workerId) {
      res.status(400);
      throw new Error('Please provide worker ID');
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      res.status(404);
      throw new Error('Worker profile not found');
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404);
        throw new Error('Order not found');
      }

      // If there was an old worker, set their status back if needed
      if (order.worker && order.worker.toString() !== workerId) {
        await Worker.findByIdAndUpdate(order.worker, { status: 'AVAILABLE' });
      }

      order.worker = workerId;
      order.status = 'ASSIGNED';
      await order.save();

      // Set new worker to busy
      worker.status = 'BUSY';
      await worker.save();

      return res.json({ success: true, message: 'Order reassigned successfully', order });
    }

    if (rideId) {
      const ride = await Ride.findById(rideId);
      if (!ride) {
        res.status(404);
        throw new Error('Ride not found');
      }

      if (ride.worker && ride.worker.toString() !== workerId) {
        await Worker.findByIdAndUpdate(ride.worker, { status: 'AVAILABLE' });
      }

      ride.worker = workerId;
      ride.status = 'ASSIGNED';
      await ride.save();

      worker.status = 'BUSY';
      await worker.save();

      return res.json({ success: true, message: 'Ride reassigned successfully', ride });
    }

    res.status(400);
    throw new Error('Please provide orderId or rideId to reassign');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process payout for a worker
 * @route   POST /api/admin/workers/:id/payout
 * @access  Private (OWNER)
 */
const settleWorkerPayout = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      res.status(404);
      throw new Error('Worker not found');
    }

    const payoutAmount = worker.pendingPayouts;
    if (payoutAmount <= 0) {
      res.status(400);
      throw new Error('Worker has no pending payout');
    }

    // Reset pending payouts
    worker.pendingPayouts = 0;
    await worker.save();

    res.json({
      success: true,
      message: `Successfully paid out ₹${payoutAmount} to worker`,
      payoutAmount,
      worker,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getStores,
  createStore,
  updateStore,
  deleteStore,
  getWorkersList,
  reassignOrder,
  settleWorkerPayout,
};
