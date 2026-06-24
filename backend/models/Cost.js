const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
  boardingPlace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingPlace',
    required: [true, 'A cost must be linked to a boarding place']
  },
  title: {
    type: String,
    required: [true, 'Cost title (e.g., Electricity, Water) is required'],
    trim: true
  },
  splitType: {
    type: String,
    enum: ['EVEN', 'CUSTOM'], // Determines if the cost is split equally or by specific percentages
    required: [true, 'Split type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Cost amount is required'],
    min: [0, 'Cost cannot be a negative number']
  },
  frequency: {
    type: String,
    enum: ['MONTHLY', 'ONE_TIME'], // Differentiates between recurring bills and one-off repairs
    required: [true, 'Frequency is required'],
    default: 'MONTHLY'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cost', costSchema);