const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['BIKE'],
      default: 'BIKE',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OFFLINE'],
      default: 'OFFLINE',
    },
    currentCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    earningsToday: {
      type: Number,
      default: 0,
    },
    earningsWeekly: {
      type: Number,
      default: 0,
    },
    earningsMonthly: {
      type: Number,
      default: 0,
    },
    tips: {
      type: Number,
      default: 0,
    },
    pendingPayouts: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    licenseNumber: {
      type: String,
      required: true,
    },

    licenseImage: {
      type: String,
      required: true,
    },

    rcNumber: {
      type: String,
      required: true,
    },

    rcImage: {
      type: String,
      required: true,
    },

    verificationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// Index coordinates for geo queries
WorkerSchema.index({ currentCoordinates: '2dsphere' });

module.exports = mongoose.model('Worker', WorkerSchema);
