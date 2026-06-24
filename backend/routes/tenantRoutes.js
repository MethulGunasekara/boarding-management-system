const express = require('express');
const router = express.Router();

// Import our security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the tenant controller
const { admitTenant } = require('../controllers/tenantController');

// 1. Secure all tenant routes: Must be logged in AND have the 'OWNER' role
router.use(protect, authorize('OWNER'));

/**
 * @route   POST /tenants
 * @desc    Submit a new tenant admission form
 * @access  Private (Owner Only)
 */
// The base path '/tenants' will be defined in server.js
router.post('/', admitTenant);

module.exports = router;