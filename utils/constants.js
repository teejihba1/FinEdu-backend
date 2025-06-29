// User roles
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

// Lesson categories
const LESSON_CATEGORIES = {
  BANKING: 'Banking',
  BUDGETING: 'Budgeting',
  INVESTING: 'Investing',
  FINANCING: 'Financing'
};

// Difficulty levels
const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Task types
const TASK_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM: 'custom'
};

// Game types
const GAME_TYPES = {
  BUDGET_QUIZ: 'budget_quiz',
  CREDIT_SIMULATION: 'credit_simulation',
  STOCK_MARKET: 'stock_market'
};

// Inventory item types
const ITEM_TYPES = {
  POTION: 'potion',
  REWARD: 'reward',
  BADGE: 'badge'
};

// Achievement types
const ACHIEVEMENT_TYPES = {
  FIRST_LESSON: 'first_lesson',
  STREAK_7: 'streak_7',
  STREAK_30: 'streak_30',
  LEVEL_5: 'level_5',
  LEVEL_10: 'level_10',
  PERFECT_SCORE: 'perfect_score',
  EARLY_BIRD: 'early_bird',
  NIGHT_OWL: 'night_owl'
};

// XP rewards for different activities
const XP_REWARDS = {
  LESSON_COMPLETION: 10,
  TASK_COMPLETION: 15,
  GAME_COMPLETION: 20,
  PERFECT_SCORE: 5,
  STREAK_BONUS: 2,
  DAILY_LOGIN: 1
};

// Health penalties
const HEALTH_PENALTIES = {
  MISSED_TASK: 5,
  MISSED_DAILY: 10,
  INACTIVE_DAY: 2
};

// File upload limits
const UPLOAD_LIMITS = {
  AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
  LESSON_CONTENT_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10
};

// Allowed file types
const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  VIDEOS: ['video/mp4', 'video/webm'],
  DOCUMENTS: ['application/pdf'],
  ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf']
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT settings
const JWT_SETTINGS = {
  DEFAULT_EXPIRE: '7d',
  REFRESH_EXPIRE: '30d'
};

// Rate limiting
const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 requests per window
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  }
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation failed',
  DUPLICATE_EMAIL: 'Email already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  LESSON_NOT_FOUND: 'Lesson not found',
  TASK_NOT_FOUND: 'Task not found',
  GAME_NOT_FOUND: 'Game session not found'
};

// Success messages
const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_LOGGED_OUT: 'User logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  LESSON_CREATED: 'Lesson created successfully',
  LESSON_UPDATED: 'Lesson updated successfully',
  LESSON_DELETED: 'Lesson deleted successfully',
  TASK_CREATED: 'Task created successfully',
  TASK_COMPLETED: 'Task completed successfully',
  GAME_STARTED: 'Game session started',
  GAME_COMPLETED: 'Game completed successfully'
};

module.exports = {
  USER_ROLES,
  LESSON_CATEGORIES,
  DIFFICULTY_LEVELS,
  TASK_TYPES,
  GAME_TYPES,
  ITEM_TYPES,
  ACHIEVEMENT_TYPES,
  XP_REWARDS,
  HEALTH_PENALTIES,
  UPLOAD_LIMITS,
  ALLOWED_FILE_TYPES,
  PAGINATION,
  JWT_SETTINGS,
  RATE_LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
}; 