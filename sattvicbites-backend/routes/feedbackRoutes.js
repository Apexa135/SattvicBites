import express from 'express';
import { getAllFeedback, createFeedback, updateFeedback, deleteFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllFeedback);
router.post('/', protect, createFeedback);
router.put('/:id', protect, updateFeedback);
router.delete('/:id', protect, deleteFeedback);

export default router;
