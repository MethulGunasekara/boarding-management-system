const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const {
  getBoardingPlaceById,
  getOwnerBoardingPlaces,
  ownerCreateBoardingPlace
} = require('../controllers/boardingPlaceController');

const { createRoom, getRoomsForPlace } = require('../controllers/roomController');
const { getTenantsByBoardingPlace, getOverdueTenants } = require('../controllers/tenantController');

// Apply middleware to all routes in this file
router.use(protect, authorize('OWNER'));

// GET /boarding-places/my-places — Get all boarding places for the logged-in owner
router.get('/my-places', getOwnerBoardingPlaces);

// POST /boarding-places — Create a new boarding place (owner self-serve)
router.post('/', ownerCreateBoardingPlace);

// GET /boarding-places/:id — Fetch specific boarding place details
router.get('/:id', getBoardingPlaceById);

// POST /boarding-places/:id/rooms — Add a room to a boarding place
router.post('/:id/rooms', createRoom);

// GET /boarding-places/:id/rooms — Get all rooms for a boarding place
router.get('/:id/rooms', getRoomsForPlace);

// GET /boarding-places/:id/tenants — Get all tenants for a boarding place
router.get('/:id/tenants', getTenantsByBoardingPlace);

// GET /boarding-places/:id/overdue — Get overdue tenants for a boarding place
router.get('/:id/overdue-tenants', getOverdueTenants);

module.exports = router;