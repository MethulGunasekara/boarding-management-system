const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const { recordPayment, getPaymentsForTenant, getPendingApprovals, reviewPayment } = require('../controllers/paymentController');

router.use(protect, authorize('OWNER'));

// POST /payments — Record a manual payment
router.post('/', recordPayment);
    
// GET /payments/tenant/:tenantId — Get all payments for a tenant
router.get('/tenant/:tenantId', getPaymentsForTenant);

// GET /payments/pending-approvals — Get all pending approvals for an owner
router.get('/pending-approvals', getPendingApprovals);

// PATCH /payments/review/:chargeId — Approve or reject a tenant's payment proof
router.patch('/review/:chargeId', reviewPayment);

module.exports = router;
