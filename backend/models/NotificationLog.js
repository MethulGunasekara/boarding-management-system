const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  channel: {
    type: String,
    enum: ['SMS', 'PUSH'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SENT', 'FAILED'],
    default: 'SENT'
  }
}, { timestamps: true });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);