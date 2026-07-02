const Payment = require('../models/Payment');
const ChargeLine = require('../models/ChargeLine');
const Tenant = require('../models/Tenant');
const BoardingPlace = require('../models/BoardingPlace');

/**
 * @desc    Record a manual payment against a tenant's balance
 * @route   POST /payments
 * @access  Private/Owner
 */
const recordPayment = async (req, res) => {
  try {
    const { tenantId, amountPaid, method, proofUrl, paidOn, chargeLineId } = req.body;

    // 1. Security Check: Verify the tenant belongs to one of the owner's boarding places
    const tenant = await Tenant.findById(tenantId).populate('boardingPlace');
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const boardingPlace = await BoardingPlace.findOne({
      _id: tenant.boardingPlace._id,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(403).json({ message: 'Forbidden: This tenant does not belong to your boarding place' });
    }

    // 2. Create the payment record
    const payment = await Payment.create({
      tenant: tenantId,
      amountPaid,
      method,
      proofUrl: proofUrl || null,
      paidOn: paidOn || new Date()
    });

    // 3. If a specific charge line was provided, mark it as PAID
    if (chargeLineId) {
      await ChargeLine.findByIdAndUpdate(chargeLineId, { status: 'PAID' });
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record payment', error: error.message });
  }
};

/**
 * @desc    Get all payments for a specific tenant
 * @route   GET /payments/tenant/:tenantId
 * @access  Private/Owner
 */
const getPaymentsForTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Security: verify ownership
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const boardingPlace = await BoardingPlace.findOne({
      _id: tenant.boardingPlace,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const payments = await Payment.find({ tenant: tenantId }).sort({ paidOn: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

module.exports = { recordPayment, getPaymentsForTenant };
