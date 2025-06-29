const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with its hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculate XP based on activity type and difficulty
 * @param {string} activityType - Type of activity (lesson, task, game)
 * @param {string} difficulty - Difficulty level
 * @param {number} baseXP - Base XP for the activity
 * @returns {number} - Calculated XP
 */
const calculateXP = (activityType, difficulty, baseXP = 10) => {
  const difficultyMultipliers = {
    'beginner': 1,
    'intermediate': 1.5,
    'advanced': 2
  };
  
  const activityMultipliers = {
    'lesson': 1,
    'task': 1.2,
    'game': 1.5
  };
  
  const multiplier = (difficultyMultipliers[difficulty] || 1) * (activityMultipliers[activityType] || 1);
  return Math.round(baseXP * multiplier);
};

/**
 * Calculate level from XP
 * @param {number} xp - Total XP
 * @returns {number} - Current level
 */
const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1;
};

/**
 * Calculate XP needed for next level
 * @param {number} currentLevel - Current level
 * @returns {number} - XP needed for next level
 */
const xpForNextLevel = (currentLevel) => {
  return currentLevel * 100;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate streak based on activity dates
 * @param {Date[]} activityDates - Array of activity dates
 * @returns {number} - Current streak count
 */
const calculateStreak = (activityDates) => {
  if (!activityDates || activityDates.length === 0) return 0;
  
  const sortedDates = activityDates
    .map(date => new Date(date))
    .sort((a, b) => b - a); // Sort descending
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentDate = today;
  
  for (let i = 0; i < sortedDates.length; i++) {
    const activityDate = new Date(sortedDates[i]);
    activityDate.setHours(0, 0, 0, 0);
    
    const diffTime = currentDate - activityDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      streak++;
      currentDate = activityDate;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} - Pagination metadata
 */
const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomString,
  calculateXP,
  calculateLevel,
  xpForNextLevel,
  isValidEmail,
  sanitizeInput,
  formatDate,
  calculateStreak,
  generatePagination
}; 