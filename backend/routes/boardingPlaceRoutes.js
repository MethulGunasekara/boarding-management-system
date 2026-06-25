const express = require('express');
const router = express.Router();

// Import our security middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Import the Owner-facing controllers
const { getBoardingPlaceById,getOwnerBoardingPlaces,ownerCreateBoardingPlace } = require('../controllers/boardingPlaceController');
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

/**
 * @route   GET /boarding-places/my-places
 * @desc    Get boarding places for the logged-in owner
 * @access  Private/Owner
 */
router.get('/my-places', protect, getOwnerBoardingPlaces);

/**
 * @route   POST /boarding-places
 * @desc    Create a new boarding place
 * @access  Private/Owner
 */
router.post('/', protect, ownerCreateBoardingPlace);

module.exports = router;