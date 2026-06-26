const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema(
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
    pickupLocation: {
      type: String,
      required: true,
    },
    pickupCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    destinationLocation: {
      type: String,
      required: true,
    },
    destinationCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    baseFare: {
      type: Number,
      required: true,
    },
    distanceFare: {
      type: Number,
      required: true,
    },
    surgeMultiplier: {
      type: Number,
      default: 1.0,
    },
    surgeAmount: {
      type: Number,
      default: 0,
    },
    finalFare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ASSIGNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
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
  },
  {
    timestamps: true,
  }
);

RideSchema.index({ pickupCoordinates: '2dsphere' });
RideSchema.index({ destinationCoordinates: '2dsphere' });

module.exports = mongoose.model('Ride', RideSchema);
