import Poll from '../models/Poll.js';

// @desc    Get current active poll
// @route   GET /api/polls/active
// @access  Public
export const getActivePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ isActive: true });
    return res.json(poll);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Vote in active poll
// @route   POST /api/polls/vote
// @access  Private
export const voteActivePoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const userId = req.user._id;

    if (!optionId) {
      return res.status(400).json({ message: 'Option ID selection is required to vote' });
    }

    const poll = await Poll.findOne({ isActive: true });
    if (!poll) {
      return res.status(404).json({ message: 'There is no active community poll at this time' });
    }

    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Selected option not found in this poll' });
    }

    // Check if user already voted (handle both oldObjectId format and newObject format)
    const existingVoteIdx = poll.votedUsers.findIndex(v => {
      if (v && v.user) {
        return v.user.toString() === userId.toString();
      }
      return v && v.toString() === userId.toString();
    });

    if (existingVoteIdx !== -1) {
      // User is changing their vote!
      const existingVote = poll.votedUsers[existingVoteIdx];
      const prevOptionId = existingVote.optionId;

      if (prevOptionId) {
        const prevOption = poll.options.id(prevOptionId);
        if (prevOption && prevOption.votes > 0) {
          prevOption.votes -= 1;
        }
      }

      // Update to new option
      option.votes += 1;
      poll.votedUsers[existingVoteIdx] = { user: userId, optionId: option._id };
    } else {
      // New vote
      option.votes += 1;
      poll.votedUsers.push({ user: userId, optionId: option._id });
    }

    await poll.save();
    return res.json(poll);

  } catch (error) {
    console.error(`[Poll Vote Error] ${error.message}`);
    return res.status(500).json({ message: `Server error casting vote: ${error.message}` });
  }
};

// @desc    Get all polls (Admin only)
// @route   GET /api/polls/admin
// @access  Private/Admin
export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find({}).sort({ createdAt: -1 });
    return res.json(polls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new poll (Admin only)
// @route   POST /api/polls/admin
// @access  Private/Admin
export const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Poll must contain a question and at least two options' });
    }

    // Auto deactivate all existing active polls
    await Poll.updateMany({ isActive: true }, { isActive: false });

    const formattedOptions = options.map(opt => ({ optionText: opt }));

    const newPoll = new Poll({
      question,
      options: formattedOptions,
      isActive: true
    });

    const savedPoll = await newPoll.save();
    return res.status(201).json(savedPoll);

  } catch (error) {
    console.error(`[Poll Create Error] ${error.message}`);
    return res.status(500).json({ message: `Server error creating poll: ${error.message}` });
  }
};

// @desc    Toggle poll active status (Admin only)
// @route   PUT /api/polls/admin/:id/toggle
// @access  Private/Admin
export const togglePollActive = async (req, res) => {
  try {
    const pollId = req.params.id;
    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const currentStatus = poll.isActive;
    
    // If we are activating this poll, deactivate others first
    if (!currentStatus) {
      await Poll.updateMany({ _id: { $ne: pollId }, isActive: true }, { isActive: false });
    }

    poll.isActive = !currentStatus;
    const updatedPoll = await poll.save();
    return res.json(updatedPoll);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a poll (Admin only)
// @route   DELETE /api/polls/admin/:id
// @access  Private/Admin
export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    await poll.deleteOne();
    return res.json({ message: 'Poll successfully deleted from logs' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
