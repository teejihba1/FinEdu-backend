const mongoose = require('mongoose');
const { ITEM_TYPES, ACHIEVEMENT_TYPES } = require('../utils/constants');

const avatarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  level: {
    type: Number,
    default: 1,
    min: [1, 'Level cannot be less than 1']
  },
  xp: {
    type: Number,
    default: 0,
    min: [0, 'XP cannot be negative']
  },
  health: {
    type: Number,
    default: 100,
    min: [0, 'Health cannot be negative'],
    max: [100, 'Health cannot exceed 100']
  },
  attack: {
    type: Number,
    default: 10,
    min: [1, 'Attack cannot be less than 1']
  },
  defense: {
    type: Number,
    default: 10,
    min: [1, 'Defense cannot be less than 1']
  },
  streak: {
    type: Number,
    default: 0,
    min: [0, 'Streak cannot be negative']
  },
  maxStreak: {
    type: Number,
    default: 0,
    min: [0, 'Max streak cannot be negative']
  },
  inventory: [{
    item: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    type: {
      type: String,
      enum: Object.values(ITEM_TYPES),
      required: true
    },
    acquiredAt: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    type: String,
    enum: Object.values(ACHIEVEMENT_TYPES)
  }],
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  totalLessonsCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Total lessons cannot be negative']
  },
  totalTasksCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Total tasks cannot be negative']
  },
  totalGamesPlayed: {
    type: Number,
    default: 0,
    min: [0, 'Total games cannot be negative']
  },
  totalXP: {
    type: Number,
    default: 0,
    min: [0, 'Total XP cannot be negative']
  }
}, {
  timestamps: true
});

// Index for better query performance
avatarSchema.index({ userId: 1 });
avatarSchema.index({ level: -1 });
avatarSchema.index({ xp: -1 });

// Virtual for XP needed for next level
avatarSchema.virtual('xpForNextLevel').get(function() {
  return this.level * 100;
});

// Virtual for XP progress to next level
avatarSchema.virtual('xpProgress').get(function() {
  const xpForCurrentLevel = (this.level - 1) * 100;
  const xpInCurrentLevel = this.xp - xpForCurrentLevel;
  const xpNeededForNextLevel = this.level * 100;
  return Math.min(100, (xpInCurrentLevel / 100) * 100);
});

// Virtual for health percentage
avatarSchema.virtual('healthPercentage').get(function() {
  return this.health;
});

// Instance method to add XP and check for level up
avatarSchema.methods.addXP = function(amount) {
  this.xp += amount;
  this.totalXP += amount;
  
  // Check for level up
  const newLevel = Math.floor(this.xp / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    // Increase stats on level up
    this.attack += 2;
    this.defense += 2;
    this.health = Math.min(100, this.health + 10);
  }
  
  return this.save();
};

// Instance method to update streak
avatarSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const diffTime = today - lastActivity;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Consecutive day
    this.streak += 1;
    this.maxStreak = Math.max(this.maxStreak, this.streak);
  } else if (diffDays > 1) {
    // Streak broken
    this.streak = 1;
  }
  
  this.lastActivityDate = new Date();
  return this.save();
};

// Instance method to add item to inventory
avatarSchema.methods.addItem = function(item, type, quantity = 1) {
  const existingItem = this.inventory.find(inv => inv.item === item && inv.type === type);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.inventory.push({
      item,
      type,
      quantity,
      acquiredAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to remove item from inventory
avatarSchema.methods.removeItem = function(item, type, quantity = 1) {
  const existingItem = this.inventory.find(inv => inv.item === item && inv.type === type);
  
  if (!existingItem || existingItem.quantity < quantity) {
    throw new Error('Insufficient items in inventory');
  }
  
  existingItem.quantity -= quantity;
  
  if (existingItem.quantity === 0) {
    this.inventory = this.inventory.filter(inv => !(inv.item === item && inv.type === type));
  }
  
  return this.save();
};

// Instance method to add achievement
avatarSchema.methods.addAchievement = function(achievement) {
  if (!this.achievements.includes(achievement)) {
    this.achievements.push(achievement);
  }
  return this.save();
};

// Instance method to use health potion
avatarSchema.methods.useHealthPotion = function() {
  const healthPotion = this.inventory.find(inv => inv.item === 'Health Potion' && inv.type === ITEM_TYPES.POTION);
  
  if (!healthPotion || healthPotion.quantity < 1) {
    throw new Error('No health potions available');
  }
  
  this.health = Math.min(100, this.health + 25);
  return this.removeItem('Health Potion', ITEM_TYPES.POTION, 1);
};

// Instance method to get avatar stats
avatarSchema.methods.getStats = function() {
  return {
    level: this.level,
    xp: this.xp,
    xpForNextLevel: this.xpForNextLevel,
    xpProgress: this.xpProgress,
    health: this.health,
    healthPercentage: this.healthPercentage,
    attack: this.attack,
    defense: this.defense,
    streak: this.streak,
    maxStreak: this.maxStreak,
    totalLessonsCompleted: this.totalLessonsCompleted,
    totalTasksCompleted: this.totalTasksCompleted,
    totalGamesPlayed: this.totalGamesPlayed,
    totalXP: this.totalXP,
    achievements: this.achievements,
    inventory: this.inventory
  };
};

// Static method to get leaderboard
avatarSchema.statics.getLeaderboard = async function(limit = 10) {
  return await this.find()
    .populate('userId', 'name email avatar')
    .sort({ level: -1, xp: -1 })
    .limit(limit);
};

// Static method to get streak leaderboard
avatarSchema.statics.getStreakLeaderboard = async function(limit = 10) {
  return await this.find()
    .populate('userId', 'name email avatar')
    .sort({ maxStreak: -1, streak: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Avatar', avatarSchema); 