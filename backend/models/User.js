const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String },          // optional when using Google OAuth
    phoneNumber: { type: String, trim: true, default: '' },
    googleId:    { type: String, default: null },
    role:        { type: String, enum: ['ADMIN', 'OWNER'], default: 'OWNER' },

    plan:                    { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    planStartDate:           { type: Date, default: null },
    nextPaymentDue:          { type: Date, default: null },
    ownerSubscriptionStatus: {
      type: String, enum: ['ACTIVE', 'OVERDUE', 'INACTIVE'], default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);