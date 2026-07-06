const mongoose = require('mongoose');

// One record per calendar month per tenant.
// If status = PAID before dueDate → pre-payment; cron skips generating a ChargeLine.
const rentRecordSchema = new mongoose.Schema(
  {
    tenant:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    monthName:  { type: String, required: true },
    monthKey:   { type: String, required: true },
    amountDue:  { type: Number, required: true },
    dueDate:    { type: Date,   required: true },
    status:     { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    paidOn:     { type: Date },
  },
  { timestamps: true }
);

rentRecordSchema.index({ tenant: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model('RentRecord', rentRecordSchema);