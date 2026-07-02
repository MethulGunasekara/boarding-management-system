const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const {
  createDeposit,
  checkEligibility,
  updateDepositStatus,
  getDepositForTenant
} = require('../controllers/depositController');

router.use(protect, authorize('OWNER'));

// POST /deposits — Record a key money deposit
router.post('/', createDeposit);

// GET /deposits/:tenantId — Get deposit for a tenant
router.get('/:tenantId', getDepositForTenant);

// GET /deposits/:tenantId/eligibility — Check refund eligibility
router.get('/:tenantId/eligibility', checkEligibility);

// PATCH /deposits/:tenantId/status — Update deposit status
router.patch('/:tenantId/status', updateDepositStatus);

module.exports = router;
