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

    // 1. Security Check
    const tenant = await Tenant.findById(tenantId).populate('boardingPlace');
    if (!tenant) {
      // The 'return' keyword is crucial here! It stops the rest of the function from running.
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

    // 3. Handle specific bills and partial payments
    if (chargeLineId) {
      const charge = await ChargeLine.findById(chargeLineId);
      
      if (charge) {
        if (amountPaid >= charge.amountDue) {
          charge.status = 'PAID';
          charge.amountDue = 0; // Balance cleared
        } else {
          charge.amountDue -= amountPaid; // Partial payment logic
        }
        await charge.save();
      }
    }

    // 4. Send the SINGLE final success response
    return res.status(201).json(payment);

  } catch (error) {
    console.error("Payment Controller Error:", error);
    // Send the SINGLE error response if something breaks
    return res.status(500).json({ message: 'Failed to record payment', error: error.message });
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
