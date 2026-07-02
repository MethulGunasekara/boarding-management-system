const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const {
  admitTenant,
  getTenantById,
  getTenantsByBoardingPlace,
  getTenantCharges,
  getOverdueTenants,
  moveTenantOut
} = require('../controllers/tenantController');

// Secure all tenant routes
router.use(protect, authorize('OWNER'));

// POST /tenants — Admit a new tenant
router.post('/', admitTenant);

// GET /tenants/by-place/:boardingPlaceId — Get all tenants for a boarding place
router.get('/by-place/:boardingPlaceId', getTenantsByBoardingPlace);

// GET /tenants/overdue/:boardingPlaceId — Get overdue tenants for a boarding place
router.get('/overdue/:boardingPlaceId', getOverdueTenants);

// GET /tenants/:id — Get a single tenant profile
router.get('/:id', getTenantById);

// GET /tenants/:id/charges — Get all charges for a tenant
router.get('/:id/charges', getTenantCharges);

// PATCH /tenants/:id/move-out — Mark tenant as moved out
router.patch('/:id/move-out', moveTenantOut);

module.exports = router;