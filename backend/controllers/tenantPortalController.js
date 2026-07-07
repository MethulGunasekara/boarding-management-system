const Tenant     = require('../models/Tenant');
const ChargeLine = require('../models/ChargeLine');
const Payment    = require('../models/Payment');

/** GET /portal/my-charges */
const getMyCharges = async (req, res) => {
  try {
    const charges = await ChargeLine.find({ tenant: req.user._id })
      .populate('costReference', 'title')
      .sort({ dueDate: -1 });

    const totalDue = charges
      .filter(c => ['PENDING', 'OVERDUE'].includes(c.status))
      .reduce((s, c) => s + c.amountDue, 0);

    res.json({ charges, totalDue });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/** GET /portal/my-payments */
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.user._id }).sort({ paidOn: -1 });
    res.json(payments);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/** POST /portal/charges/:id/pay — tenant submits payment proof */
const submitPayment = async (req, res) => {
  try {
    const { proofUrl } = req.body;

    if (!proofUrl) {
      return res.status(400).json({ message: 'Proof of payment image is required' });
    }

    // Find the charge — must belong to this tenant
    const charge = await ChargeLine.findById(req.params.id);

    if (!charge) {
      return res.status(404).json({ message: 'Charge not found' });
    }

    // Verify this charge actually belongs to the logged-in tenant
    if (charge.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: this charge does not belong to you' });
    }

    if (!['PENDING', 'OVERDUE'].includes(charge.status)) {
      return res.status(400).json({
        message: `This charge cannot be paid — current status is ${charge.status}`,
      });
    }

    charge.status            = 'UNDER_REVIEW';
    charge.proofOfPaymentUrl = proofUrl;
    await charge.save();

    res.json(charge);
  } catch (e) {
    console.error('submitPayment error:', e.message);
    res.status(500).json({ message: e.message });
  }
};

/** PATCH /portal/change-password */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const tenant = await Tenant.findById(req.user._id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const isMatch = await tenant.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    tenant.password = newPassword; // pre-save hook hashes it
    await tenant.save();

    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getMyCharges, getMyPayments, submitPayment, changePassword };