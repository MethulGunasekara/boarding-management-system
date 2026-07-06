const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllOwners, getOwnerById, changeOwnerPlan, setOwnerStatus,
  markSubscriptionPaid, generateSubscriptionRecord,
} = require('../controllers/ownerSubscriptionController');

router.use(protect, authorize('ADMIN'));

router.get('/owners',                             getAllOwners);
router.get('/owners/:id',                         getOwnerById);
router.patch('/owners/:id/plan',                  changeOwnerPlan);
router.patch('/owners/:id/status',                setOwnerStatus);
router.patch('/owner-subscriptions/:id/pay',      markSubscriptionPaid);
router.post('/owner-subscriptions/:ownerId/generate', generateSubscriptionRecord);

module.exports = router;