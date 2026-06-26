const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  instructions: { type: String, default: '' },
});

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      default: null,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null, // Null for custom store pickup orders
    },
    orderType: {
      type: String,
      enum: ['FOOD', 'GROCERY', 'CUSTOM'],
      required: true,
    },
    items: [OrderItemSchema],
    customStoreDetails: {
      storeName: { type: String, default: '' },
      shoppingList: { type: String, default: '' }, // Text description or line-separated list
      shoppingInstructions: { type: String, default: '' },
      referenceImage: { type: String, default: '' },
    },
    estimatedCartValue: {
      type: Number,
      required: true,
      min: [200, 'Minimum order value is ₹200'],
    },
    billAmount: {
      type: Number,
      default: 0,
    },
    serviceCharge: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    billImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'RECEIVED',
        'ASSIGNED',
        'PURCHASE_IN_PROGRESS',
        'BILL_UPLOADED',
        'PAYMENT_CONFIRMED',
        'OUT_FOR_DELIVERY',
        'COMPLETED',
        'REJECTED',
      ],
      default: 'RECEIVED',
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    deliveryCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Geo spatial index for delivery coordinates
OrderSchema.index({ deliveryCoordinates: '2dsphere' });

module.exports = mongoose.model('Order', OrderSchema);
