const mongoose = require('mongoose');

const chargeLineSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'A charge must be assigned to a specific tenant']
  },
  costReference: { 
    // Links back to the generic 'Cost' rule if applicable (null for one-off charges like rent)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cost'
  },
  type: {
    type: String,
    enum: ['RENT', 'UTILITY', 'FEE', 'OTHER'], // Categorizes the revenue
    required: [true, 'Charge type is required']
  },
  amountDue: {
    type: Number,
    required: [true, 'Amount due is required'],
    min: [0, 'Charge amount cannot be negative']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'OVERDUE', 'VOID'], // The lifecycle of a debt
    default: 'PENDING',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChargeLine', chargeLineSchema);