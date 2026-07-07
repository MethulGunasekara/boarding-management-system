const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    channel:   { type: String, enum: ['SMS', 'EMAIL', 'PUSH', 'SYSTEM'], default: 'SYSTEM' },
    type:      { type: String, enum: ['REMINDER', 'OVERDUE', 'REGISTRATION', 'GENERAL'], default: 'GENERAL' },
    message:   { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null }, // e.g. owner _id for registrations
    isRead:    { type: Boolean, default: false },
    sentAt:    { type: Date, default: Date.now },
    status:    { type: String, enum: ['SENT', 'FAILED', 'PENDING'], default: 'SENT' },
  },
  { timestamps: false }
);

module.exports = mongoose.model('NotificationLog', notificationLogSchema);