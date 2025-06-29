// User roles
export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

// Lesson categories
export const LESSON_CATEGORIES = {
  BUDGETING: "budgeting",
  SAVING: "saving",
  INVESTING: "investing",
  CREDIT: "credit",
  INSURANCE: "insurance",
  TAXES: "taxes",
  BANKING: "banking",
  ENTREPRENEURSHIP: "entrepreneurship",
};

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

// Task types
export const TASK_TYPES = {
  DAILY_HABIT: "daily_habit",
  LEARNING_GOAL: "learning_goal",
  PRACTICAL_EXERCISE: "practical_exercise",
  QUIZ: "quiz",
  PROJECT: "project",
};

// Game types
export const GAME_TYPES = {
  BUDGET_QUIZ: "budget_quiz",
  CREDIT_SIMULATION: "credit_simulation",
  STOCK_MARKET: "stock_market",
  SAVINGS_CHALLENGE: "savings_challenge",
};

// Language options
export const LANGUAGES = {
  EN: "en",
  HI: "hi",
  KN: "kn",
};

// API endpoints
export const ENDPOINTS = {
  AUTH: "/auth",
  USERS: "/users",
  LESSONS: "/lessons",
  TASKS: "/tasks",
  GAMES: "/games",
  AVATAR: "/avatar",
  CHATBOT: "/chatbot",
  ANALYTICS: "/analytics",
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  LANGUAGE: "language",
  THEME: "theme",
  OFFLINE_DATA: "offline_data",
  LAST_SYNC: "last_sync",
};

// App configuration
export const APP_CONFIG = {
  NAME: "FinEdu",
  VERSION: "1.0.0",
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  PAGINATION_LIMIT: 10,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  OFFLINE_RETRY_ATTEMPTS: 3,
};

// XP and leveling system
export const GAMIFICATION = {
  XP_PER_LESSON: 50,
  XP_PER_TASK: 25,
  XP_PER_GAME: 30,
  XP_PER_QUIZ_CORRECT: 10,
  HEALTH_PER_TASK: 10,
  HEALTH_LOSS_PER_DAY: 5,
  MAX_HEALTH: 100,
  LEVEL_XP_BASE: 100,
  LEVEL_XP_MULTIPLIER: 1.5,
};

// Responsive breakpoints
export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

// Animation durations (in ms)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  OFFLINE_ERROR: "This feature requires an internet connection.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  LESSON_COMPLETED: "Great job! Lesson completed successfully.",
  TASK_COMPLETED: "Task completed! You earned health points.",
  GAME_COMPLETED: "Game completed! Check your score.",
  PROFILE_UPDATED: "Profile updated successfully.",
  AVATAR_UPDATED: "Avatar updated successfully.",
  DATA_SAVED: "Data saved successfully.",
};

// Avatar customization options
export const AVATAR_OPTIONS = {
  SKIN_TONES: [
    "#FDBCB4",
    "#EEA990",
    "#D08B5B",
    "#AE5D29",
    "#8B4513",
    "#654321",
  ],
  HAIR_COLORS: [
    "#2F1B14",
    "#A0522D",
    "#8B4513",
    "#DEB887",
    "#F4A460",
    "#FFE4C4",
  ],
  CLOTHING_COLORS: [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
  ],
  ACCESSORIES: ["glasses", "hat", "headband", "earrings", "necklace", "watch"],
};

// Regional settings for rural India
export const REGIONAL_SETTINGS = {
  CURRENCY: {
    SYMBOL: "₹",
    CODE: "INR",
    DECIMAL_PLACES: 2,
  },
  DATE_FORMAT: "DD/MM/YYYY",
  TIME_FORMAT: "12h",
  FIRST_DAY_OF_WEEK: 1, // Monday
  BANKING_EXAMPLES: [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank",
    "Canara Bank",
  ],
  PAYMENT_METHODS: [
    "UPI",
    "Paytm",
    "Google Pay",
    "PhonePe",
    "Cash",
    "Bank Transfer",
  ],
};

// Accessibility settings
export const ACCESSIBILITY = {
  MIN_TOUCH_TARGET: 44, // pixels
  MAX_CONTRAST_RATIO: 7, // WCAG AAA
  MIN_CONTRAST_RATIO: 4.5, // WCAG AA
  FONT_SIZE_MULTIPLIERS: [0.8, 1.0, 1.2, 1.4, 1.6],
  READING_SPEEDS: {
    SLOW: 150, // words per minute
    NORMAL: 200,
    FAST: 250,
  },
};

// Offline capabilities
export const OFFLINE_CONFIG = {
  MAX_CACHED_LESSONS: 10,
  MAX_CACHED_TASKS: 50,
  MAX_CACHED_GAMES: 5,
  SYNC_INTERVAL: 30000, // 30 seconds
  RETRY_DELAY: 5000, // 5 seconds
  MAX_OFFLINE_ACTIONS: 100,
};

export default {
  USER_ROLES,
  LESSON_CATEGORIES,
  DIFFICULTY_LEVELS,
  TASK_TYPES,
  GAME_TYPES,
  LANGUAGES,
  ENDPOINTS,
  STORAGE_KEYS,
  APP_CONFIG,
  GAMIFICATION,
  BREAKPOINTS,
  ANIMATIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  AVATAR_OPTIONS,
  REGIONAL_SETTINGS,
  ACCESSIBILITY,
  OFFLINE_CONFIG,
};
