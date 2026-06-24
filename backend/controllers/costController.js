const Cost = require('../models/Cost');
const BoardingPlace = require('../models/BoardingPlace');

/**
 * @desc    Create a new shared cost rule
 * @route   POST /costs
 * @access  Private/Owner
 */
const createCost = async (req, res) => {
  try {
    const { boardingPlaceId, title, splitType, amount, frequency } = req.body;

    // 1. Security Check: Verify the owner actually owns this boarding place
    const boardingPlace = await BoardingPlace.findOne({
      _id: boardingPlaceId,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(403).json({ message: 'Forbidden: You do not own this boarding place' });
    }

    // 2. Validate splitType to ensure it strictly matches our Schema Enum
    if (!['EVEN', 'CUSTOM'].includes(splitType)) {
      return res.status(400).json({ message: 'Invalid split type. Must be EVEN or CUSTOM.' });
    }

    // 3. Create the cost rule
    const cost = await Cost.create({
      boardingPlace: boardingPlaceId,
      title,
      splitType,
      amount,
      frequency: frequency || 'MONTHLY' // Default to monthly if not explicitly provided
    });

    res.status(201).json(cost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create cost rule', error: error.message });
  }
};

const Tenant = require('../models/Tenant'); // We need the Tenant model for our math engine

/**
 * @desc    View dynamically calculated cost allocations
 * @route   GET /costs/:id/allocations
 * @access  Private/Owner
 */
const getCostAllocations = async (req, res) => {
  try {
    const costId = req.params.id;

    // 1. Fetch the cost and populate the boarding place to verify ownership
    const cost = await Cost.findById(costId).populate('boardingPlace');

    // Security check: Ensure the cost exists and the logged-in owner owns the parent boarding place
    if (!cost || cost.boardingPlace.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Cost not found or unauthorized access' });
    }

    // 2. Fetch all ACTIVE tenants in this specific boarding place
    const activeTenants = await Tenant.find({
      boardingPlace: cost.boardingPlace._id,
      status: 'ACTIVE'
    }).populate('room', 'roomNumber'); // Pull in the room number for a better frontend display

    if (activeTenants.length === 0) {
      return res.status(400).json({ message: 'No active tenants found to allocate this cost to' });
    }

    let allocations = [];

    // 3. The Math Engine
    if (cost.splitType === 'EVEN') {
      // JavaScript floating point math can be tricky, so we round to 2 decimal places
      const splitAmount = Number((cost.amount / activeTenants.length).toFixed(2));
      
      allocations = activeTenants.map(tenant => ({
        tenantId: tenant._id,
        tenantName: tenant.fullName,
        roomNumber: tenant.room.roomNumber,
        allocatedAmount: splitAmount
      }));
    } else {
      // For CUSTOM splits, we send back a null amount so the frontend knows 
      // to render input fields for the owner to manually type in the custom amounts.
      allocations = activeTenants.map(tenant => ({
        tenantId: tenant._id,
        tenantName: tenant.fullName,
        roomNumber: tenant.room.roomNumber,
        allocatedAmount: null, 
        requiresManualInput: true
      }));
    }

    // 4. Send back a clean, aggregated object for the frontend to render
    res.json({
      costTitle: cost.title,
      totalAmount: cost.amount,
      splitType: cost.splitType,
      activeTenantCount: activeTenants.length,
      allocations
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate allocations', error: error.message });
  }
};

module.exports = { createCost, getCostAllocations };
