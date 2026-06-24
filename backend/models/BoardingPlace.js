const mongoose = require('mongoose');

const boardingPlaceSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Creates a relationship with the User collection
    required: [true, 'A boarding place must belong to an owner']
  },
  name: {
    type: String,
    required: [true, 'Boarding place name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'OVERDUE'], // Strictly controls allowed statuses
    required: [true, 'Subscription status is required'],
    default: 'ACTIVE'
  },
  subscriptionRenewalDate: {
    type: Date,
    required: [true, 'Subscription renewal date is required']
  }
}, {
  timestamps: true // Gives us free createdAt and updatedAt tracking
});

module.exports = mongoose.model('BoardingPlace', boardingPlaceSchema);