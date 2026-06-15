import express from 'express';
import { 
  getActivePoll, 
  voteActivePoll, 
  getAllPolls, 
  createPoll, 
  togglePollActive, 
  deletePoll 
} from '../controllers/pollController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/active', getActivePoll);
router.post('/vote', protect, voteActivePoll);

// Admin routes
router.get('/admin', protect, adminOnly, getAllPolls);
router.post('/admin', protect, adminOnly, createPoll);
router.put('/admin/:id/toggle', protect, adminOnly, togglePollActive);
router.delete('/admin/:id', protect, adminOnly, deletePoll);

export default router;
