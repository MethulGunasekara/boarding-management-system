const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    price:              { type: Number, required: true, min: 0 },       // monthly Rs.
    maxBoardingPlaces:  { type: Number, required: true, min: 1 },
    maxRoomsPerPlace:   { type: Number, required: true, min: 1 },
    features:           [{ type: String, trim: true }],                 // bullet list
    isActive:           { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);