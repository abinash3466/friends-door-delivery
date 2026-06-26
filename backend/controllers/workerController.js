const Order = require('../models/Order');
const Ride = require('../models/Ride');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const { calculateOrderInvoice } = require('../utils/serviceChargeCalculator');

/**
 * @desc    Get live jobs feed (unassigned orders and ride requests)
 * @route   GET /api/worker/jobs
 * @access  Private (WORKER)
 */
const getJobsFeed = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      res.status(404);
      throw new Error('Worker profile not found');
    }

    // Unassigned orders
    const pendingOrders = await Order.find({ status: 'RECEIVED', worker: null })
      .populate('customer', 'name phone')
      .populate('store', 'name type locationName coordinates')
      .sort({ createdAt: -1 });

    // Unassigned rides
    const pendingRides = await Ride.find({ status: 'REQUESTED', worker: null })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      workerStatus: worker.status,
      orders: pendingOrders,
      rides: pendingRides,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update worker status (AVAILABLE, BUSY, OFFLINE)
 * @route   PUT /api/worker/status
 * @access  Private (WORKER)
 */
const updateWorkerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['AVAILABLE', 'BUSY', 'OFFLINE'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status option');
    }

    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { $set: { status } },
      { new: true }
    ).populate('user', 'name phone');

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a job (Order or Ride)
 * @route   POST /api/worker/accept
 * @access  Private (WORKER)
 */
const acceptJob = async (req, res, next) => {
  try {
    const { orderId, rideId } = req.body;

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      res.status(404);
      throw new Error('Worker profile not found');
    }

    if (worker.status === 'OFFLINE') {
      res.status(400);
      throw new Error('You cannot accept jobs while offline');
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404);
        throw new Error('Order not found');
      }
      if (order.worker) {
        res.status(400);
        throw new Error('Order already accepted by another partner');
      }

      order.worker = worker._id;
      order.status = 'ASSIGNED';
      await order.save();

      worker.status = 'BUSY';
      await worker.save();

      // Notify Customer
      await Notification.create({
        user: order.customer,
        title: 'Delivery Partner Assigned',
        message: `${req.user.name} is assigned to deliver your order.`,
        type: 'ORDER_STATUS',
      });

      return res.json({ success: true, message: 'Order accepted successfully', order });
    }

    if (rideId) {
      const ride = await Ride.findById(rideId);
      if (!ride) {
        res.status(404);
        throw new Error('Ride not found');
      }
      if (ride.worker) {
        res.status(400);
        throw new Error('Ride already accepted by another partner');
      }

      ride.worker = worker._id;
      ride.status = 'ASSIGNED';
      await ride.save();

      worker.status = 'BUSY';
      await worker.save();

      // Notify Customer
      await Notification.create({
        user: ride.customer,
        title: 'Driver Assigned',
        message: `${req.user.name} is on their way to pick you up.`,
        type: 'RIDE_STATUS',
      });

      return res.json({ success: true, message: 'Ride accepted successfully', ride });
    }

    res.status(400);
    throw new Error('Provide orderId or rideId to accept job');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload bill details & invoice from store purchase
 * @route   POST /api/worker/order/:id/invoice
 * @access  Private (WORKER)
 */
const uploadInvoice = async (req, res, next) => {
  try {
    const { billAmount } = req.body;
    const orderId = req.params.id;

    if (!billAmount || isNaN(billAmount) || billAmount <= 0) {
      res.status(400);
      throw new Error('Please enter a valid bill amount');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const worker = await Worker.findOne({ user: req.user._id });
    if (!order.worker || order.worker.toString() !== worker._id.toString()) {
      res.status(403);
      throw new Error('You are not authorized for this order');
    }

    // Determine path for bill image (if uploaded via multer, req.file.path exists)
    let billImage = '/uploads/receipt.jpg'; // default placeholder
    if (req.file) {
      billImage = `/uploads/${req.file.filename}`;
    } else if (req.body.billImage) {
      billImage = req.body.billImage;
    }

    // Calculate invoice totals
    const invoice = calculateOrderInvoice(billAmount, 5); // Mock 5km distance for fee calculation if not specified

    // Update order
    order.billAmount = invoice.billAmount;
    order.serviceCharge = invoice.serviceCharge;
    order.deliveryCharge = invoice.deliveryCharge;
    order.grandTotal = invoice.grandTotal;
    order.billImage = billImage;
    order.status = 'BILL_UPLOADED';
    await order.save();

    // Notify Customer
    await Notification.create({
      user: order.customer,
      title: 'Bill Uploaded',
      message: `Your final bill of ₹${invoice.grandTotal} is ready for payment confirmation.`,
      type: 'ORDER_STATUS',
    });

    res.json({
      success: true,
      message: 'Invoice generated and uploaded',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update status of an active job
 * @route   PUT /api/worker/job-status
 * @access  Private (WORKER)
 */
const updateJobStatus = async (req, res, next) => {
  try {
    const { orderId, rideId, status } = req.body;
    const worker = await Worker.findOne({ user: req.user._id });

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order || order.worker.toString() !== worker._id.toString()) {
        res.status(404);
        throw new Error('Order not found or not assigned to you');
      }

      order.status = status;
      
      // If completed, payout calculation
      if (status === 'COMPLETED') {
        order.paymentStatus = 'PAID';
        await order.save();

        // Worker earns 100% of Delivery Charge + 10 rupees incentive
        const workerEarnings = (order.deliveryCharge || 35) + 10;
        
        worker.earningsToday += workerEarnings;
        worker.earningsWeekly += workerEarnings;
        worker.earningsMonthly += workerEarnings;
        worker.pendingPayouts += workerEarnings;
        worker.status = 'AVAILABLE';
        await worker.save();

        // Notify Customer
        await Notification.create({
          user: order.customer,
          title: 'Order Completed',
          message: 'Your order has been delivered successfully. Thank you!',
          type: 'ORDER_STATUS',
        });
      } else {
        await order.save();
      }

      return res.json({ success: true, message: 'Order status updated', order });
    }

    if (rideId) {
      const ride = await Ride.findById(rideId);
      if (!ride || ride.worker.toString() !== worker._id.toString()) {
        res.status(404);
        throw new Error('Ride not found or not assigned to you');
      }

      ride.status = status;

      if (status === 'COMPLETED') {
        ride.paymentStatus = 'PAID';
        await ride.save();

        // Worker gets 80% of final fare, 20% goes to company
        const workerEarnings = Math.round(ride.finalFare * 0.8);

        worker.earningsToday += workerEarnings;
        worker.earningsWeekly += workerEarnings;
        worker.earningsMonthly += workerEarnings;
        worker.pendingPayouts += workerEarnings;
        worker.status = 'AVAILABLE';
        await worker.save();

        // Notify Customer
        await Notification.create({
          user: ride.customer,
          title: 'Ride Completed',
          message: 'You have reached your destination. Thank you for riding with us!',
          type: 'RIDE_STATUS',
        });
      } else {
        await ride.save();
      }

      return res.json({ success: true, message: 'Ride status updated', ride });
    }

    res.status(400);
    throw new Error('Provide orderId or rideId to update status');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get worker earnings details
 * @route   GET /api/worker/earnings
 * @access  Private (WORKER)
 */
const getWorkerEarnings = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      res.status(404);
      throw new Error('Worker profile not found');
    }

    res.json({
      success: true,
      earnings: {
        today: worker.earningsToday,
        weekly: worker.earningsWeekly,
        monthly: worker.earningsMonthly,
        tips: worker.tips,
        pendingPayouts: worker.pendingPayouts,
        rating: worker.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobsFeed,
  updateWorkerStatus,
  acceptJob,
  uploadInvoice,
  updateJobStatus,
  getWorkerEarnings,
};
