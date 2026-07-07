const NotificationLog = require('../models/NotificationLog');

/** GET /notifications/log — recent notifications (admin) */
const getNotificationLogs = async (req, res) => {
  try {
    const logs = await NotificationLog.find().sort({ sentAt: -1 }).limit(50);
    res.json(logs);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** GET /notifications/registrations — new owner registration alerts (admin) */
const getRegistrationAlerts = async (req, res) => {
  try {
    const alerts = await NotificationLog.find({ type: 'REGISTRATION' }).sort({ sentAt: -1 }).limit(20);
    res.json(alerts);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** PATCH /notifications/:id/read */
const markRead = async (req, res) => {
  try {
    const log = await NotificationLog.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!log) return res.status(404).json({ message: 'Notification not found' });
    res.json(log);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { getNotificationLogs, getRegistrationAlerts, markRead };