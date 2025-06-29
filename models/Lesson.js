const mongoose = require('mongoose');
const { LESSON_CATEGORIES, DIFFICULTY_LEVELS } = require('../utils/constants');

const exerciseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  options: [{
    type: String,
    required: [true, 'Options are required'],
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer is required'],
    min: [0, 'Correct answer must be a valid option index']
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required'],
    trim: true
  },
  points: {
    type: Number,
    default: 10,
    min: [1, 'Points must be at least 1']
  }
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: Object.values(LESSON_CATEGORIES)
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'pt', 'hi', 'zh']
  },
  content: {
    text: {
      type: String,
      required: [true, 'Lesson content is required'],
      trim: true
    },
    images: [{
      type: String,
      trim: true
    }],
    videos: [{
      type: String,
      trim: true
    }],
    exercises: [exerciseSchema]
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: Object.values(DIFFICULTY_LEVELS)
  },
  xpReward: {
    type: Number,
    default: 10,
    min: [1, 'XP reward must be at least 1']
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 15,
    min: [1, 'Duration must be at least 1 minute']
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  completionCount: {
    type: Number,
    default: 0,
    min: [0, 'Completion count cannot be negative']
  },
  averageScore: {
    type: Number,
    default: 0,
    min: [0, 'Average score cannot be negative'],
    max: [100, 'Average score cannot exceed 100']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: [0, 'Rating count cannot be negative']
  }
}, {
  timestamps: true
});

// Index for better query performance
lessonSchema.index({ category: 1, difficulty: 1 });
lessonSchema.index({ isPublished: 1 });
lessonSchema.index({ createdBy: 1 });
lessonSchema.index({ language: 1 });
lessonSchema.index({ tags: 1 });

// Virtual for lesson URL
lessonSchema.virtual('lessonUrl').get(function() {
  return `${process.env.BASE_URL || 'http://localhost:5000'}/api/lessons/${this._id}`;
});

// Virtual for content URLs
lessonSchema.virtual('contentUrls').get(function() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return {
    images: this.content.images.map(img => `${baseUrl}/uploads/lessons/${img}`),
    videos: this.content.videos.map(video => `${baseUrl}/uploads/lessons/${video}`)
  };
});

// Instance method to increment completion count
lessonSchema.methods.incrementCompletion = function() {
  this.completionCount += 1;
  return this.save();
};

// Instance method to update average score
lessonSchema.methods.updateAverageScore = function(newScore) {
  const totalScore = this.averageScore * this.ratingCount + newScore;
  this.ratingCount += 1;
  this.averageScore = totalScore / this.ratingCount;
  return this.save();
};

// Instance method to add rating
lessonSchema.methods.addRating = function(rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const totalRating = this.rating * this.ratingCount + rating;
  this.ratingCount += 1;
  this.rating = totalRating / this.ratingCount;
  return this.save();
};

// Instance method to get lesson stats
lessonSchema.methods.getStats = function() {
  return {
    completionCount: this.completionCount,
    averageScore: this.averageScore,
    rating: this.rating,
    ratingCount: this.ratingCount,
    estimatedDuration: this.estimatedDuration,
    exerciseCount: this.content.exercises.length
  };
};

// Static method to find published lessons
lessonSchema.statics.findPublished = function() {
  return this.find({ isPublished: true });
};

// Static method to find lessons by category
lessonSchema.statics.findByCategory = function(category) {
  return this.find({ category, isPublished: true });
};

// Static method to find lessons by difficulty
lessonSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, isPublished: true });
};

// Static method to find featured lessons
lessonSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isPublished: true });
};

// Static method to search lessons
lessonSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isPublished: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  });
};

// Static method to get lesson statistics
lessonSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalLessons: { $sum: 1 },
        publishedLessons: { $sum: { $cond: ['$isPublished', 1, 0] } },
        totalCompletions: { $sum: '$completionCount' },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  
  return stats[0] || {
    totalLessons: 0,
    publishedLessons: 0,
    totalCompletions: 0,
    averageRating: 0
  };
};

// Static method to get lessons by creator
lessonSchema.statics.findByCreator = function(creatorId) {
  return this.find({ createdBy: creatorId });
};

module.exports = mongoose.model('Lesson', lessonSchema); 