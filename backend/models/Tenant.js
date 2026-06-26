const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tenantSchema = new mongoose.Schema({
  boardingPlace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingPlace',
    required: [true, 'Tenant must be linked to a boarding place for security scoping']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Tenant must be assigned to a room']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required for portal login'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required for portal login']
  },
  address: { type: String, required: true },
  nicNumber: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  courseOrWorkplace: { type: String, required: true },
  
  // Emergency Contact Sub-document structure for clean grouping
  emergencyContact: {
    name: { type: String, required: true },
    number: { type: String, required: true }
  },

  // File URLs (to be populated later via Cloudinary uploads)
  idFrontImageUrl: { type: String, required: true },
  idBackImageUrl: { type: String, required: true },
  signatureImageUrl: { type: String, required: true },

  admissionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'MOVED_OUT'], // Helps filter active tenants for billing
    default: 'ACTIVE',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook for password hashing
tenantSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- ADDED: Instance method to compare passwords ---
tenantSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Tenant', tenantSchema);