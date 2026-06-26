const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
});

const StoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Restaurant', 'Grocery', 'Pharmacy', 'Bakery', 'Provision Store', 'Custom Shop'],
      required: [true, 'Store type is required'],
    },
    locationName: {
      type: String,
      required: [true, 'Location name is required'],
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    items: [MenuItemSchema],
  },
  {
    timestamps: true,
  }
);

StoreSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Store', StoreSchema);
