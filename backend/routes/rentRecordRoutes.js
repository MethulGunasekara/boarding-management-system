const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getRentRecords, createRentRecord, markRentPaid } = require('../controllers/rentRecordController');

router.use(protect, authorize('OWNER'));

router.get('/:tenantId',   getRentRecords);
router.post('/',            createRentRecord);
router.patch('/:id/pay',   markRentPaid);

module.exports = router;