const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getNotificationLogs, getRegistrationAlerts, markRead } = require('../controllers/notificationController');

router.use(protect, authorize('ADMIN'));

router.get('/log',             getNotificationLogs);
router.get('/registrations',   getRegistrationAlerts);
router.patch('/:id/read',      markRead);

module.exports = router;