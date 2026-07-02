const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const { recordPayment, getPaymentsForTenant } = require('../controllers/paymentController');

router.use(protect, authorize('OWNER'));

// POST /payments — Record a manual payment
router.post('/', recordPayment);

// GET /payments/tenant/:tenantId — Get all payments for a tenant
router.get('/tenant/:tenantId', getPaymentsForTenant);

module.exports = router;
