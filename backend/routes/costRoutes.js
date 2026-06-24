const express = require('express');
const router = express.Router();

// Import our security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the cost controller
const { createCost, getCostAllocations } = require('../controllers/costController');
const { generateCharges } = require('../controllers/chargeController');

// 1. Secure all cost routes: Must be logged in AND have the 'OWNER' role
router.use(protect, authorize('OWNER'));

/**
 * @route   POST /costs
 * @desc    Create a new shared cost rule (e.g., Electricity, Water)
 * @access  Private (Owner Only)
 */
// The base path '/costs' will be defined in server.js
router.post('/', createCost);

/**
 * @route   GET /costs/:id/allocations
 * @desc    View dynamically calculated cost allocations
 * @access  Private (Owner Only)
 */
router.get('/:id/allocations', getCostAllocations);

/**
 * @route   POST /costs/:id/charges
 * @desc    Generate actual charge lines (debts) for a specific cost
 * @access  Private (Owner Only)
 */
router.post('/:id/charges', generateCharges);

module.exports = router;