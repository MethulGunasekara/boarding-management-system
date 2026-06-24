const express = require('express');
const router = express.Router();

// Import our security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the Owner-facing controllers
const { getBoardingPlaceById } = require('../controllers/boardingPlaceController');
const { createRoom } = require('../controllers/roomController');

// 1. Apply middleware to all routes in this file
// Any request coming in must have a valid JWT AND belong to an OWNER
router.use(protect, authorize('OWNER'));

/**
 * @route   GET /boarding-places/:id
 * @desc    Fetch specific boarding place details for the owner dashboard
 * @access  Private (Owner Only)
 */
// The base path '/boarding-places' will be defined in server.js
router.get('/:id', getBoardingPlaceById);

/**
 * @route   POST /boarding-places/:id/rooms
 * @desc    Add a new room to a boarding place
 * @access  Private (Owner Only)
 */
router.post('/:id/rooms', createRoom);

module.exports = router;