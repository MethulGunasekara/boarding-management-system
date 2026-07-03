const ChargeLine = require('../models/ChargeLine');

/**
 * @desc    Get logged-in tenant's charges and balance
 * @route   GET /portal/my-charges
 * @access  Private/Tenant
 */
const getMyCharges = async (req, res) => {
  try {
    // req.user._id comes from your JWT token authentication middleware!
    const charges = await ChargeLine.find({ tenant: req.user._id })
      .populate('costReference', 'title') // If it's a shared utility, get the title
      .sort({ dueDate: -1 });

    // Calculate total outstanding
    const totalDue = charges
      .filter(c => c.status === 'PENDING')
      .reduce((sum, c) => sum + c.amountDue, 0);

    res.json({ charges, totalDue });
  } catch (error) {
    console.error("Portal Error:", error);
    res.status(500).json({ message: 'Failed to load your bills' });
  }
};
/**
 * @desc    Submit proof of payment for a specific bill
 * @route   POST /portal/charges/:id/pay
 * @access  Private/Tenant
 */
const submitPaymentProof = async (req, res) => {
  try {
    const chargeId = req.params.id;
    const { proofUrl } = req.body;

    if (!proofUrl) {
      return res.status(400).json({ message: 'Payment proof image is required' });
    }

    // 1. Find the charge and ensure it belongs to THIS logged-in tenant
    const charge = await ChargeLine.findOne({
      _id: chargeId,
      tenant: req.user._id
    });

    if (!charge) {
      return res.status(404).json({ message: 'Bill not found or unauthorized' });
    }

    if (charge.status === 'PAID') {
      return res.status(400).json({ message: 'This bill is already paid.' });
    }

    // 2. Update the bill with the image and change the status
    charge.status = 'UNDER_REVIEW';
    charge.proofOfPaymentUrl = proofUrl;
    await charge.save();

    res.json({ message: 'Payment submitted for review successfully', charge });
  } catch (error) {
    console.error("Payment Submission Error:", error);
    res.status(500).json({ message: 'Failed to submit payment' });
  }
};

module.exports = { getMyCharges, submitPaymentProof };