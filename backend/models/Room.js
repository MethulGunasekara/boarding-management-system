const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  boardingPlace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingPlace', // Links back to the parent entity
    required: [true, 'A room must belong to a boarding place']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'A room must be able to hold at least one person']
  }
}, {
  timestamps: true
});

// Compound index: Ensures roomNumber is unique ONLY within its specific boardingPlace
roomSchema.index({ boardingPlace: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);