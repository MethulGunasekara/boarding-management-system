const mongoose = require('mongoose');

// One record per calendar month per owner.
// If status = PAID before dueDate → pre-payment; cron skips that period.
const ownerSubscriptionSchema = new mongoose.Schema(
  {
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    monthName:   { type: String, required: true },   // e.g. "July 2025"
    monthKey:    { type: String, required: true },   // e.g. "2025-07" — used for dedup
    amountDue:   { type: Number, required: true },
    dueDate:     { type: Date,   required: true },
    status:      { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    paidOn:      { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate records for the same owner + month
ownerSubscriptionSchema.index({ owner: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model('OwnerSubscription', ownerSubscriptionSchema);