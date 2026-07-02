const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const { createBoardingPlace, toggleSubscription, getOverdueBoardingPlaces } = require('../controllers/boardingPlaceController');
const User = require('../models/User');
const BoardingPlace = require('../models/BoardingPlace');

// Admin: Create boarding place
router.post('/boarding-places', protect, authorize('ADMIN'), createBoardingPlace);

// Admin: Toggle subscription
router.patch('/boarding-places/:id/subscription', protect, authorize('ADMIN'), toggleSubscription);

// Admin: Get platform-wide overdue boarding places
router.get('/overdue', protect, authorize('ADMIN'), getOverdueBoardingPlaces);

// Admin: Get all users (owners + admins)
router.get('/users', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Admin: Get all boarding places with owner info
router.get('/boarding-places', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const places = await BoardingPlace.find()
      .populate('owner', 'fullName email contactNumber')
      .sort({ createdAt: -1 });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch boarding places', error: error.message });
  }
});

module.exports = router;