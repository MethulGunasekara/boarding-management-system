const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const { getNotificationLogs } = require('../controllers/notificationController');

// Secure the route: Only ADMIN should view system-wide notification logs
router.use(protect, authorize('ADMIN'));

/**
 * @route   GET /notifications/log
 * @desc    Get a log of all system notifications (SMS, PUSH)
 * @access  Private (Admin Only)
 */
router.get('/log', getNotificationLogs);

module.exports = router;