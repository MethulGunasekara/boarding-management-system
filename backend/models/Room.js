const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  boardingPlace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BoardingPlace',
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Room capacity must be at least 1'],
    },
  },
  { 
    timestamps: true 
  }
);

// Compound index: Ensures roomNumber is unique ONLY within its specific boardingPlace
roomSchema.index({ boardingPlace: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);