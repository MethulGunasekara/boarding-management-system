const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Bring in our hashing library

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['ADMIN', 'OWNER'], // Restricts values to strictly these two
    required: [true, 'A valid user role is required']
  },
  // 1. ADDED: Full Name field
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Creates a MongoDB index to ensure no duplicate emails
    lowercase: true,
    trim: true
  },
  // 2. ADDED: Contact Number field
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  }
}, {
  timestamps: true // Automatically manages 'createdAt' and 'updatedAt' fields
});

//-------------------------------------------------------------------------------------------------------------------------------------------

// Pre-save hook: runs automatically right before doc.save() is executed
userSchema.pre('save', async function() {
  // If the password hasn't been changed, just return and do nothing
  if (!this.isModified('password')) {
    return; 
  }
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: allows us to call user.matchPassword('123456') in our controllers
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);