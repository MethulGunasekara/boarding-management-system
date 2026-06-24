const express = require('express');
const router = express.Router();

// Import our security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the tenant portal controllers
const { getTenantDashboard, getTenantBills } = require('../controllers/tenantPortalController');

// 1. Secure all routes: Must be logged in AND have the 'TENANT' role
router.use(protect, authorize('TENANT'));

/**
 * @route   GET /portal/dashboard
 * @desc    Get logged-in tenant's profile and room data
 * @access  Private (Tenant Only)
 */
// The base path '/portal' will be defined in server.js
router.get('/dashboard', getTenantDashboard);

/**
 * @route   GET /portal/bills
 * @desc    Get logged-in tenant's utility bills
 * @access  Private (Tenant Only)
 */
router.get('/bills', getTenantBills);

module.exports = router;