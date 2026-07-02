const NotificationLog = require('../models/NotificationLog');

// GET /notifications/log
const getNotificationLogs = async (req, res) => {
  try {
    // In a real app, you'd filter this by the owner's boarding place, 
    // but for the MVP Admin dashboard, we can fetch all.
    const logs = await NotificationLog.find()
      .populate('tenant', 'fullName contactNumber')
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notification logs' });
  }
};

module.exports = { getNotificationLogs };