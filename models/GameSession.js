const mongoose = require('mongoose');
const { GAME_TYPES } = require('../utils/constants');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  gameType: {
    type: String,
    required: [true, 'Game type is required'],
    enum: Object.values(GAME_TYPES)
  },
  score: {
    type: Number,
    default: 0,
    min: [0, 'Score cannot be negative']
  },
  maxScore: {
    type: Number,
    default: 100,
    min: [1, 'Max score must be at least 1']
  },
  level: {
    type: Number,
    default: 1,
    min: [1, 'Level cannot be less than 1']
  },
  duration: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  xpEarned: {
    type: Number,
    default: 0,
    min: [0, 'XP earned cannot be negative']
  },
  achievements: [{
    type: String,
    trim: true
  }],
  gameData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  attempts: {
    type: Number,
    default: 1,
    min: [1, 'Attempts must be at least 1']
  },
  bestScore: {
    type: Number,
    default: 0,
    min: [0, 'Best score cannot be negative']
  },
  accuracy: {
    type: Number,
    default: 0,
    min: [0, 'Accuracy cannot be negative'],
    max: [100, 'Accuracy cannot exceed 100']
  },
  timeBonus: {
    type: Number,
    default: 0,
    min: [0, 'Time bonus cannot be negative']
  },
  streakBonus: {
    type: Number,
    default: 0,
    min: [0, 'Streak bonus cannot be negative']
  }
}, {
  timestamps: true
});

// Index for better query performance
gameSessionSchema.index({ userId: 1 });
gameSessionSchema.index({ gameType: 1 });
gameSessionSchema.index({ score: -1 });
gameSessionSchema.index({ completedAt: -1 });
gameSessionSchema.index({ isCompleted: 1 });

// Virtual for score percentage
gameSessionSchema.virtual('scorePercentage').get(function() {
  if (this.maxScore === 0) return 0;
  return Math.min(100, (this.score / this.maxScore) * 100);
});

// Virtual for game duration in minutes
gameSessionSchema.virtual('durationMinutes').get(function() {
  return Math.round(this.duration / 60 * 100) / 100;
});

// Virtual for total bonus points
gameSessionSchema.virtual('totalBonus').get(function() {
  return this.timeBonus + this.streakBonus;
});

// Virtual for final score with bonuses
gameSessionSchema.virtual('finalScore').get(function() {
  return this.score + this.totalBonus;
});

// Instance method to complete the game session
gameSessionSchema.methods.complete = function(finalScore, xpEarned, achievements = []) {
  this.score = finalScore;
  this.xpEarned = xpEarned;
  this.achievements = achievements;
  this.isCompleted = true;
  this.completedAt = new Date();
  this.duration = Math.floor((this.completedAt - this.startedAt) / 1000);
  
  // Update best score if current score is higher
  if (finalScore > this.bestScore) {
    this.bestScore = finalScore;
  }
  
  return this.save();
};

// Instance method to update score during gameplay
gameSessionSchema.methods.updateScore = function(newScore) {
  this.score = Math.max(this.score, newScore);
  return this.save();
};

// Instance method to add achievement
gameSessionSchema.methods.addAchievement = function(achievement) {
  if (!this.achievements.includes(achievement)) {
    this.achievements.push(achievement);
  }
  return this.save();
};

// Instance method to calculate accuracy
gameSessionSchema.methods.calculateAccuracy = function(correctAnswers, totalQuestions) {
  if (totalQuestions === 0) return 0;
  this.accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  return this.save();
};

// Instance method to get game session stats
gameSessionSchema.methods.getStats = function() {
  return {
    score: this.score,
    scorePercentage: this.scorePercentage,
    maxScore: this.maxScore,
    level: this.level,
    duration: this.duration,
    durationMinutes: this.durationMinutes,
    xpEarned: this.xpEarned,
    accuracy: this.accuracy,
    timeBonus: this.timeBonus,
    streakBonus: this.streakBonus,
    totalBonus: this.totalBonus,
    finalScore: this.finalScore,
    achievements: this.achievements,
    isCompleted: this.isCompleted,
    attempts: this.attempts,
    bestScore: this.bestScore
  };
};

// Static method to find user's game sessions
gameSessionSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find completed game sessions
gameSessionSchema.statics.findCompleted = function() {
  return this.find({ isCompleted: true });
};

// Static method to find game sessions by type
gameSessionSchema.statics.findByType = function(gameType) {
  return this.find({ gameType });
};

// Static method to get leaderboard for a specific game type
gameSessionSchema.statics.getLeaderboard = async function(gameType, limit = 10) {
  return await this.find({
    gameType,
    isCompleted: true
  })
  .populate('userId', 'name email avatar')
  .sort({ score: -1, duration: 1 })
  .limit(limit);
};

// Static method to get user's best scores
gameSessionSchema.statics.getUserBestScores = async function(userId) {
  return await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isCompleted: true } },
    {
      $group: {
        _id: '$gameType',
        bestScore: { $max: '$score' },
        totalGames: { $sum: 1 },
        averageScore: { $avg: '$score' },
        totalXP: { $sum: '$xpEarned' },
        totalDuration: { $sum: '$duration' }
      }
    }
  ]);
};

// Static method to get game statistics
gameSessionSchema.statics.getGameStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$gameType',
        totalSessions: { $sum: 1 },
        completedSessions: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        averageScore: { $avg: '$score' },
        totalXP: { $sum: '$xpEarned' },
        totalDuration: { $sum: '$duration' }
      }
    }
  ]);
  
  return stats;
};

// Static method to get recent high scores
gameSessionSchema.statics.getRecentHighScores = async function(limit = 10) {
  return await this.find({
    isCompleted: true,
    score: { $gte: 80 } // Only high scores (80% or above)
  })
  .populate('userId', 'name email avatar')
  .sort({ completedAt: -1 })
  .limit(limit);
};

// Static method to get user's game history
gameSessionSchema.statics.getUserHistory = async function(userId, limit = 20) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('GameSession', gameSessionSchema);