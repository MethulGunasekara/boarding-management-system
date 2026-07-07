const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  admitTenant, getTenantsByBoardingPlace, getTenantById,
  editTenant, getTenantCharges, getOverdueTenants, moveTenantOut,
} = require('../controllers/tenantController');

router.use(protect, authorize('OWNER'));

router.get('/by-place/:boardingPlaceId', getTenantsByBoardingPlace);
router.get('/overdue/:boardingPlaceId',  getOverdueTenants);
router.post('/',                         admitTenant);
router.get('/:id',                       getTenantById);
router.patch('/:id',                     editTenant);
router.get('/:id/charges',               getTenantCharges);
router.patch('/:id/move-out',            moveTenantOut);

module.exports = router;