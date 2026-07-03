const express = require('express');
const router = express.Router();
const { getMyCharges,submitPaymentProof } = require('../controllers/tenantPortalController');
const { protect } = require('../middleware/authMiddleware'); // Your JWT verifier

// All routes here will start with /portal
router.get('/my-charges', protect, getMyCharges);
router.post('/charges/:id/pay', protect, submitPaymentProof);

module.exports = router;