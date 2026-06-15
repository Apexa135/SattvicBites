import Notification from '../models/Notification.js';

// @desc    Get active notifications
// @route   GET /api/notifications
// @access  Public
export const getActiveNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notifications (Admin)
// @route   GET /api/notifications/admin
// @access  Private/Admin
export const getAllNotificationsAdmin = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create notification (Admin)
// @route   POST /api/notifications/admin
// @access  Private/Admin
export const createNotification = async (req, res) => {
  try {
    const { message, type } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Notification message cannot be empty' });
    }
    const notification = await Notification.create({
      message: message.trim(),
      type: type || 'Announcement'
    });
    return res.status(201).json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle notification active state (Admin)
// @route   PUT /api/notifications/admin/:id/toggle
// @access  Private/Admin
export const toggleNotificationActive = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isActive = !notification.isActive;
    const updated = await notification.save();
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification (Admin)
// @route   DELETE /api/notifications/admin/:id
// @access  Private/Admin
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await notification.deleteOne();
    return res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
