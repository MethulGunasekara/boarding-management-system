const ChargeLine = require('../models/ChargeLine');
const Cost = require('../models/Cost');

/**
 * @desc    Generate actual charge lines for a specific cost
 * @route   POST /costs/:id/charges
 * @access  Private/Owner
 */
const generateCharges = async (req, res) => {
  try {
    const costId = req.params.id;
    // The frontend will send the exact amounts (whether EVEN or CUSTOM) back to us
    const { allocations, dueDate } = req.body; 

    // 1. Security Check: Verify cost exists and belongs to the owner's boarding place
    const cost = await Cost.findById(costId).populate('boardingPlace');
    if (!cost || cost.boardingPlace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this cost' });
    }

    if (!allocations || allocations.length === 0) {
      return res.status(400).json({ message: 'Allocations array is required' });
    }

    // 2. Prepare the array of documents to insert
    const chargeLinesToInsert = allocations.map(allocation => ({
      tenant: allocation.tenantId,
      costReference: cost._id,
      type: 'UTILITY', // Categorize as utility since it comes from a shared cost
      amountDue: allocation.amount,
      dueDate: dueDate || new Date(), // If no due date provided, it's due immediately
      status: 'PENDING'
    }));

    // 3. Bulk Insert: Massive performance boost compared to running .save() in a loop
    const createdCharges = await ChargeLine.insertMany(chargeLinesToInsert);

    res.status(201).json({
      message: `Successfully generated ${createdCharges.length} charges.`,
      charges: createdCharges
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to generate charges', error: error.message });
  }
};

module.exports = { generateCharges };