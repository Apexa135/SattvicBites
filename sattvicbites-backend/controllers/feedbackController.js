import Feedback from '../models/Feedback.js';

// @desc    Get all feedback entries
// @route   GET /api/feedback
// @access  Public
export const getAllFeedback = async (req, res) => {
  try {
    const reviews = await Feedback.find({})
      .populate('user', 'name city')
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a customer feedback review
// @route   POST /api/feedback
// @access  Private
export const createFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating stars and comment content are required' });
    }

    const review = new Feedback({
      user: req.user._id,
      rating,
      comment
    });

    const savedReview = await review.save();
    
    // Fetch populated info
    const populated = await Feedback.findById(savedReview._id).populate('user', 'name city');
    return res.status(201).json(populated);

  } catch (error) {
    console.error(`[Feedback Create Error] ${error.message}`);
    return res.status(500).json({ message: `Server failure saving feedback: ${error.message}` });
  }
};

// @desc    Update a customer feedback review
// @route   PUT /api/feedback/:id
// @access  Private
export const updateFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Feedback.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();
    const populated = await Feedback.findById(updatedReview._id).populate('user', 'name city');
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a customer feedback review
// @route   DELETE /api/feedback/:id
// @access  Private
export const deleteFeedback = async (req, res) => {
  try {
    const review = await Feedback.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    return res.json({ message: 'Review successfully removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

