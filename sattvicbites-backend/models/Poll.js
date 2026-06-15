import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [pollOptionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  votedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  }]
}, {
  timestamps: true
});

const Poll = mongoose.model('Poll', pollSchema);
export default Poll;
