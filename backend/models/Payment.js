const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'A payment must be linked to a specific tenant']
  },
  amountPaid: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be greater than zero']
  },
  method: {
    type: String,
    enum: ['CASH', 'BANK_TRANSFER', 'OTHER'], // Strict categorizations make financial reporting much easier later
    required: [true, 'Payment method is required']
  },
  proofUrl: {
    type: String, // Will store the secure Cloudinary URL for digital receipts
    trim: true
  },
  paidOn: {
    type: Date,
    required: [true, 'The date the payment was made is required'],
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);