import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getAllOrders, 
  verifyOrderPayment, 
  approveOrder, 
  deliverOrder, 
  deliverAllOrders 
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateCutoffs } from '../middleware/cutoffMiddleware.js';

const router = express.Router();

// User order paths
router.post('/', protect, validateCutoffs, createOrder);
router.get('/my-orders', protect, getMyOrders);

// Admin order control paths
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/admin/verify/:id', protect, adminOnly, verifyOrderPayment);
router.put('/admin/approve/:id', protect, adminOnly, approveOrder);
router.put('/admin/deliver/:id', protect, adminOnly, deliverOrder);
router.put('/admin/deliver-all', protect, adminOnly, deliverAllOrders);

export default router;
