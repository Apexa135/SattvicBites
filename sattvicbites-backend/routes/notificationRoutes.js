import express from 'express';
import {
  getActiveNotifications,
  getAllNotificationsAdmin,
  createNotification,
  toggleNotificationActive,
  deleteNotification
} from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getActiveNotifications);

// Admin routes
router.get('/admin', protect, adminOnly, getAllNotificationsAdmin);
router.post('/admin', protect, adminOnly, createNotification);
router.put('/admin/:id/toggle', protect, adminOnly, toggleNotificationActive);
router.delete('/admin/:id', protect, adminOnly, deleteNotification);

export default router;
