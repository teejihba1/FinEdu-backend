const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  context: {
    type: String,
    trim: true,
    default: ''
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'pt', 'hi', 'zh']
  },
  confidence: {
    type: Number,
    default: 0.5,
    min: [0, 'Confidence cannot be negative'],
    max: [1, 'Confidence cannot exceed 1']
  },
  sources: [{
    type: String,
    trim: true
  }],
  metadata: {
    userRole: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    sessionId: String,
    responseTime: Number // in milliseconds
  },
  isHelpful: {
    type: Boolean,
    default: null // null = not rated, true = helpful, false = not helpful
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
chatHistorySchema.index({ userId: 1 });
chatHistorySchema.index({ createdAt: -1 });
chatHistorySchema.index({ language: 1 });
chatHistorySchema.index({ 'metadata.userRole': 1 });

// Virtual for response time in seconds
chatHistorySchema.virtual('responseTimeSeconds').get(function() {
  return this.metadata.responseTime ? this.metadata.responseTime / 1000 : null;
});

// Static method to get user's chat history
chatHistorySchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get chat statistics
chatHistorySchema.statics.getStats = async function(userId = null) {
  const match = userId ? { userId } : {};
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        averageConfidence: { $avg: '$confidence' },
        helpfulCount: {
          $sum: { $cond: ['$isHelpful', 1, 0] }
        },
        notHelpfulCount: {
          $sum: { $cond: [{ $eq: ['$isHelpful', false] }, 1, 0] }
        },
        averageResponseTime: {
          $avg: '$metadata.responseTime'
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalConversations: 0,
    averageConfidence: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    averageResponseTime: 0
  };
};

// Static method to get popular questions
chatHistorySchema.statics.getPopularQuestions = async function(limit = 10) {
  return await this.aggregate([
    {
      $group: {
        _id: '$question',
        count: { $sum: 1 },
        averageConfidence: { $avg: '$confidence' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Instance method to mark as helpful/not helpful
chatHistorySchema.methods.markHelpful = function(isHelpful, feedback = '') {
  this.isHelpful = isHelpful;
  if (feedback) this.feedback = feedback;
  return this.save();
};

module.exports = mongoose.model('ChatHistory', chatHistorySchema); 