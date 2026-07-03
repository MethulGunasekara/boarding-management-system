const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');

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

const ChargeLine = require('../models/ChargeLine');
const BoardingPlace = require('../models/BoardingPlace');

/**
 * @desc    Get all UNDER_REVIEW payments for an owner
 * @route   GET /payments/pending-approvals
 * @access  Private/Owner
 */
const getPendingApprovals = async (req, res) => {
  try {
    // 1. Find all boarding places owned by this user
    const places = await BoardingPlace.find({ owner: req.user._id }).select('_id');
    const placeIds = places.map(p => p._id);

    // 2. Find all UNDER_REVIEW charges for tenants in those places
    // (We populate the tenant to get their name and room!)
    const pendingCharges = await ChargeLine.find({ status: 'UNDER_REVIEW' })
      .populate({
        path: 'tenant',
        match: { boardingPlace: { $in: placeIds } },
        select: 'fullName room',
        populate: { path: 'room', select: 'roomNumber' }
      })
      .populate('costReference', 'title')
      .sort({ updatedAt: -1 });

    // Filter out any null tenants (just a safety check)
    const validCharges = pendingCharges.filter(c => c.tenant !== null);

    res.json(validCharges);
  } catch (error) {
    console.error("Fetch Approvals Error:", error);
    res.status(500).json({ message: 'Failed to fetch pending approvals' });
  }
};

/**
 * @desc    Approve or reject a tenant's payment proof
 * @route   PATCH /payments/review/:chargeId
 * @access  Private/Owner
 */
const reviewPayment = async (req, res) => {
  try {
    const { chargeId } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    const charge = await ChargeLine.findById(chargeId).populate('tenant');
    if (!charge) return res.status(404).json({ message: 'Charge not found' });

    // Basic security: Ensure the owner owns the tenant's boarding place
    const place = await BoardingPlace.findOne({ _id: charge.tenant.boardingPlace, owner: req.user._id });
    if (!place) return res.status(403).json({ message: 'Unauthorized action' });

    if (action === 'APPROVE') {
      charge.status = 'PAID';
      charge.amountDue = 0;
    } else if (action === 'REJECT') {
      charge.status = 'PENDING';
      charge.proofOfPaymentUrl = null; // Clear the bad image
    } else {
      return res.status(400).json({ message: 'Invalid action. Use APPROVE or REJECT' });
    }

    await charge.save();
    res.json({ message: `Payment ${action.toLowerCase()}d successfully`, charge });

  } catch (error) {
    console.error("Review Payment Error:", error);
    res.status(500).json({ message: 'Failed to review payment' });
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

module.exports = { recordPayment, getPaymentsForTenant, getPendingApprovals, reviewPayment };
