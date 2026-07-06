const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getActivePlans, getAllPlans, createPlan, updatePlan, deletePlan } = require('../controllers/planController');

router.get('/', getActivePlans); // public

router.use(protect, authorize('ADMIN'));
router.get('/all',     getAllPlans);
router.post('/',       createPlan);
router.put('/:id',     updatePlan);
router.delete('/:id',  deletePlan);

module.exports = router;