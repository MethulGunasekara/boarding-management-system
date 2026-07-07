const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyCharges, getMyPayments, submitPayment, changePassword } = require('../controllers/tenantPortalController');

router.use(protect, authorize('TENANT'));

router.get('/my-charges',            getMyCharges);
router.get('/my-payments',           getMyPayments);
router.post('/charges/:id/pay',      submitPayment);
router.patch('/change-password',     changePassword);

module.exports = router;