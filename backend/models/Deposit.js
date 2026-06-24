const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant', // Ties the deposit to the specific tenant who paid it
    required: [true, 'A deposit must be linked to a specific tenant']
  },
  amount: {
    type: Number,
    required: [true, 'Deposit amount is required'],
    min: [0, 'Deposit cannot be a negative number']
  },
  minimumStayMonths: {
    type: Number,
    required: [true, 'Minimum stay duration (in months) is required'],
    min: [1, 'Minimum stay must be at least 1 month']
  },
  refundEligibleDate: {
    type: Date,
    required: [true, 'Calculated date when the tenant is eligible for a refund is required']
  },
  status: {
    type: String,
    enum: ['HELD', 'REFUNDED', 'FORFEITED'], // Strict lifecycle states for the deposit
    required: [true, 'Deposit status is required'],
    default: 'HELD'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Deposit', depositSchema);