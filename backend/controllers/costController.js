const Cost = require('../models/Cost');
const BoardingPlace = require('../models/BoardingPlace');
const Tenant = require('../models/Tenant');           
const ChargeLine = require('../models/ChargeLine');

const createCost = async (req, res) => {
  try {
    const { boardingPlaceId, title, splitType, amount, frequency } = req.body;

    const boardingPlace = await BoardingPlace.findOne({ _id: boardingPlaceId, owner: req.user._id });
    if (!boardingPlace) return res.status(403).json({ message: 'Forbidden' });

    // UPDATED VALIDATION
    if (!['EVEN', 'CUSTOM', 'MANUAL'].includes(splitType)) {
      return res.status(400).json({ message: 'Invalid split type.' });
    }

    const cost = await Cost.create({
      boardingPlace: boardingPlaceId, title, splitType, amount, frequency: frequency || 'MONTHLY'
    });

    res.status(201).json(cost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create cost rule', error: error.message });
  }
};

const getCostAllocations = async (req, res) => {
  try {
    const costId = req.params.id;
    const cost = await Cost.findById(costId).populate('boardingPlace');

    if (!cost || cost.boardingPlace.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Cost not found or unauthorized' });
    }

    const activeTenants = await Tenant.find({ boardingPlace: cost.boardingPlace._id, status: 'ACTIVE' }).populate('room', 'roomNumber');

    if (activeTenants.length === 0) return res.status(400).json({ message: 'No active tenants found.' });

    let allocations = [];

    if (cost.splitType === 'EVEN') {
      const splitAmount = Number((cost.amount / activeTenants.length).toFixed(2));
      allocations = activeTenants.map(tenant => ({
        tenantId: tenant._id, tenantName: tenant.fullName, roomNumber: tenant.room?.roomNumber || 'N/A', allocatedAmount: splitAmount
      }));
    } else {
      // For BOTH Custom (Percentages) and Manual (Exact amounts), we send null. The frontend UI will do the heavy lifting!
      allocations = activeTenants.map(tenant => ({
        tenantId: tenant._id, tenantName: tenant.fullName, roomNumber: tenant.room?.roomNumber || 'N/A', allocatedAmount: null,
      }));
    }

    res.json({
      costTitle: cost.title, totalAmount: cost.amount, splitType: cost.splitType, activeTenantCount: activeTenants.length, allocations
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate allocations', error: error.message });
  }
};
/**
 * @desc    Confirm math and generate actual ChargeLine bills for a cost
 * @route   POST /costs/:id/charges
 * @access  Private/Owner
 */
const generateCharges = async (req, res) => {
  try {
    const costId = req.params.id;
    const { allocations } = req.body; // This is the array of { tenantId, amount } from your React frontend

    // 1. Security Check
    const cost = await Cost.findById(costId).populate('boardingPlace');
    if (!cost || cost.boardingPlace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this cost record.' });
    }

    // 2. Generate the bills based on the exact amounts the frontend calculated!
    const chargePromises = allocations.map(alloc => {
      // Create a bill due 7 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      return ChargeLine.create({
        tenant: alloc.tenantId,
        costReference: costId,
        type: 'SHARED_COST', // e.g., Water, WiFi, Electricity
        amountDue: alloc.amount,
        dueDate: dueDate,
        status: 'PENDING'
      });
    });

    // Run them all at the same time
    await Promise.all(chargePromises);

    res.status(201).json({ message: 'Charges generated successfully' });
  } catch (error) {
    console.error("Charge Generation Error:", error);
    res.status(500).json({ message: 'Failed to generate charges', error: error.message });
  }
};

module.exports = {
  createCost,
  getCostAllocations,
  generateCharges 
};
