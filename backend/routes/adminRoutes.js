const express = require('express');
const router = express.Router();

// Import our security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the admin controllers
const { createBoardingPlace,toggleSubscription } = require('../controllers/boardingPlaceController');

/**
 * @route   POST /admin/boarding-places
 * @desc    Create a new boarding place
 * @access  Private (Admin Only)
 */
// The request must pass through 'protect' (valid JWT) AND 'authorize' (role is ADMIN)
router.post('/boarding-places', protect, authorize('ADMIN'), createBoardingPlace);

/**
 * @route   PATCH /admin/boarding-places/:id/subscription
 * @desc    Toggle a boarding place's subscription status
 * @access  Private (Admin Only)
 */
// The ':id' acts as a dynamic placeholder. Express parses this into req.params.id in our controller.
router.patch('/boarding-places/:id/subscription', protect, authorize('ADMIN'), toggleSubscription);

module.exports = router;