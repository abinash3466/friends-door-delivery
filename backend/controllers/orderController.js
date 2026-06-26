const Order = require('../models/Order');
const Store = require('../models/Store');
const Notification = require('../models/Notification');
const Worker = require('../models/Worker');

/**
 * @desc    Create a new order (Food, Grocery, or Custom Store Delivery)
 * @route   POST /api/orders
 * @access  Private (CUSTOMER)
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      orderType,
      storeId,
      items,
      customStoreDetails,
      estimatedCartValue,
      deliveryAddress,
      deliveryCoordinates,
      paymentMethod,
      notes,
    } = req.body;

    // 1. Validate Minimum Order Value: ₹200
    const cartValue = parseFloat(estimatedCartValue) || 0;
    if (cartValue < 200) {
      return res.status(400).json({
        success: false,
        message: 'Minimum order value is ₹200.',
      });
    }

    let finalStoreId = storeId;

    // Check store existence if provided
    if (storeId) {
      const storeExists = await Store.findById(storeId);
      if (!storeExists) {
        res.status(404);
        throw new Error('Selected store not found');
      }
    }

    // 2. Build order payload
    const orderData = {
      customer: req.user._id,
      orderType,
      store: finalStoreId || null,
      items: items || [],
      estimatedCartValue: cartValue,
      deliveryAddress,
      deliveryCoordinates,
      paymentMethod: paymentMethod || 'COD',
      status: 'RECEIVED',
      paymentStatus: 'PENDING',
      notes: notes || '',
    };

    // If Custom Shop Dunzo delivery, populate custom fields
    if (orderType === 'CUSTOM') {
      if (!customStoreDetails || !customStoreDetails.storeName || !customStoreDetails.shoppingList) {
        res.status(400);
        throw new Error('Custom store name and shopping list are required for custom orders');
      }
      orderData.customStoreDetails = customStoreDetails;
    }

    const order = await Order.create(orderData);

    // Create Customer Notification
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed successfully',
      message: `Your order #${order._id.toString().slice(-6)} of estimated value ₹${cartValue} has been received.`,
      type: 'ORDER_STATUS',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer's orders
 * @route   GET /api/orders/my-orders
 * @access  Private (CUSTOMER)
 */
const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('store', 'name type locationName')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name phone' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order details
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('store', 'name type locationName coordinates')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name phone' },
      });

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check authorization: Owner, Assigned Worker, or the Customer who placed it can view
    const isOwner = req.user.role === 'OWNER';
    const isCustomerOwner = order.customer._id.toString() === req.user._id.toString();
    const isAssignedWorker = order.worker && order.worker.user.toString() === req.user._id.toString();

    if (!isOwner && !isCustomerOwner && !isAssignedWorker) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process order payment (COD confirmation or mock Razorpay payment)
 * @route   POST /api/orders/:id/pay
 * @access  Private (CUSTOMER)
 */
const payOrder = async (req, res, next) => {
  try {
    const { paymentMethod, razorpayPaymentId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to pay for this order');
    }

    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.paymentStatus = 'PAID';
    
    // If order was waiting on billing, update status to payment confirmed
    if (order.status === 'BILL_UPLOADED') {
      order.status = 'PAYMENT_CONFIRMED';
    }

    await order.save();

    // Create Notification
    await Notification.create({
      user: order.customer,
      title: 'Payment Confirmed',
      message: `Payment of ₹${order.grandTotal || order.estimatedCartValue} confirmed for order #${order._id.toString().slice(-6)}.`,
      type: 'ORDER_STATUS',
    });

    res.json({
      success: true,
      message: 'Payment received successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderDetails,
  payOrder,
};
