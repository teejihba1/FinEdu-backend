const mongoose = require('mongoose');
const { TASK_TYPES, LESSON_CATEGORIES } = require('../utils/constants');

const taskCompletionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  submittedFiles: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const taskSchema = new mongoose.Schema({
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
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Task type is required'],
    enum: Object.values(TASK_TYPES)
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: Object.values(LESSON_CATEGORIES)
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigner is required']
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  xpReward: {
    type: Number,
    default: 15,
    min: [1, 'XP reward must be at least 1']
  },
  healthPenalty: {
    type: Number,
    default: 5,
    min: [0, 'Health penalty cannot be negative']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 30,
    min: [1, 'Duration must be at least 1 minute']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [2000, 'Instructions cannot exceed 2000 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Interval must be at least 1']
    }
  },
  completions: [taskCompletionSchema],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ isActive: 1 });

// Virtual for completion status
taskSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Virtual for completion count
taskSchema.virtual('completionCount').get(function() {
  return this.completions.length;
});

// Virtual for completion rate
taskSchema.virtual('completionRate').get(function() {
  if (this.assignedTo.length === 0) return 0;
  return (this.completions.length / this.assignedTo.length) * 100;
});

// Virtual for average score
taskSchema.virtual('averageScore').get(function() {
  if (this.completions.length === 0) return 0;
  const totalScore = this.completions.reduce((sum, completion) => sum + (completion.score || 0), 0);
  return totalScore / this.completions.length;
});

// Instance method to check if student has completed the task
taskSchema.methods.isCompletedByStudent = function(studentId) {
  return this.completions.some(completion => completion.student.toString() === studentId.toString());
};

// Instance method to get student completion
taskSchema.methods.getStudentCompletion = function(studentId) {
  return this.completions.find(completion => completion.student.toString() === studentId.toString());
};

// Instance method to mark task as completed by student
taskSchema.methods.markCompleted = function(studentId, score = null, notes = '', submittedFiles = []) {
  const existingCompletion = this.getStudentCompletion(studentId);
  
  if (existingCompletion) {
    // Update existing completion
    existingCompletion.completedAt = new Date();
    if (score !== null) existingCompletion.score = score;
    if (notes) existingCompletion.notes = notes;
    if (submittedFiles.length > 0) existingCompletion.submittedFiles = submittedFiles;
  } else {
    // Add new completion
    this.completions.push({
      student: studentId,
      completedAt: new Date(),
      score,
      notes,
      submittedFiles
    });
  }
  
  return this.save();
};

// Instance method to get task statistics
taskSchema.methods.getStats = function() {
  return {
    totalAssigned: this.assignedTo.length,
    completed: this.completions.length,
    completionRate: this.completionRate,
    averageScore: this.averageScore,
    overdue: this.isOverdue,
    daysUntilDue: Math.ceil((this.dueDate - new Date()) / (1000 * 60 * 60 * 24))
  };
};

// Static method to find tasks assigned to a student
taskSchema.statics.findByStudent = function(studentId) {
  return this.find({
    assignedTo: studentId,
    isActive: true
  }).populate('assignedBy', 'name email');
};

// Static method to find tasks assigned by a teacher
taskSchema.statics.findByTeacher = function(teacherId) {
  return this.find({
    assignedBy: teacherId
  }).populate('assignedTo', 'name email');
};

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    isActive: true
  });
};

// Static method to find tasks due today
taskSchema.statics.findDueToday = function() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    dueDate: {
      $gte: today,
      $lt: tomorrow
    },
    isActive: true
  });
};

// Static method to find tasks by type
taskSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to find tasks by category
taskSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method to get task statistics
taskSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        activeTasks: { $sum: { $cond: ['$isActive', 1, 0] } },
        overdueTasks: {
          $sum: {
            $cond: [
              { $and: ['$isActive', { $gt: ['$dueDate', new Date()] }] },
              1,
              0
            ]
          }
        },
        totalCompletions: { $sum: { $size: '$completions' } }
      }
    }
  ]);
  
  return stats[0] || {
    totalTasks: 0,
    activeTasks: 0,
    overdueTasks: 0,
    totalCompletions: 0
  };
};

module.exports = mongoose.model('Task', taskSchema); 