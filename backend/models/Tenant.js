const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const tenantSchema = new mongoose.Schema(
  {
    // ── Required ──────────────────────────────────────────
    fullName:      { type: String, required: true, trim: true },
    email:         {
      type: String, required: true, unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password:      { type: String },   // optional if using Google OAuth
    googleId:      { type: String, default: null },
    contactNumber: {
      type: String, required: true, trim: true,
      match: [/^(\+94|0)[0-9]{9}$/, 'Please provide a valid Sri Lankan phone number (e.g. 0771234567)'],
    },
    nicNumber:     { type: String, required: true, trim: true },
    room:          { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    boardingPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'BoardingPlace', required: true },
    rentAmount:    { type: Number, required: true, default: 0 ,min: 0},

    // ── Optional ──────────────────────────────────────────
    address:           { type: String, trim: true, default: '' },
    courseOrWorkplace: { type: String, trim: true, default: '' },
    emergencyContact: {
      name:   { type: String, trim: true, default: '' },
      number: {
        type: String, trim: true, default: '',
        validate: {
          validator: v => !v || /^(\+94|0)[0-9]{9}$/.test(v),
          message:   'Please provide a valid Sri Lankan phone number',
        },
      },
    },
    idFrontImageUrl:   { type: String, default: '' },
    idBackImageUrl:    { type: String, default: '' },
    signatureImageUrl: { type: String, default: '' },

    // ── System fields ─────────────────────────────────────
    admissionDate: { type: Date, default: Date.now },
    status:        { type: String, enum: ['ACTIVE', 'MOVED_OUT'], default: 'ACTIVE' },
    movedOutDate:  { type: Date, default: null },   // used by cleanup cron
  },
  { timestamps: true }
);

tenantSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

tenantSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Tenant', tenantSchema);