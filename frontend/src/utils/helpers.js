import { GAMIFICATION, REGIONAL_SETTINGS } from "./constants";

// Date formatting utilities
export const formatDate = (date, format = "short") => {
  const d = new Date(date);

  if (format === "short") {
    return d.toLocaleDateString("en-IN");
  }

  if (format === "long") {
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (format === "relative") {
    const now = new Date();
    const diffInMs = now - d;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return d.toLocaleDateString("en-IN");
  }

  return d.toLocaleDateString("en-IN");
};

// Currency formatting for Indian Rupees
export const formatCurrency = (amount, showSymbol = true) => {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: REGIONAL_SETTINGS.CURRENCY.CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? formatted : formatted.replace("₹", "").trim();
};

// Number formatting with Indian numbering system
export const formatNumber = (num, compact = false) => {
  if (compact && num >= 10000000) {
    return `${(num / 10000000).toFixed(1)}Cr`; // Crores
  }
  if (compact && num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`; // Lakhs
  }
  if (compact && num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`; // Thousands
  }

  return new Intl.NumberFormat("en-IN").format(num);
};

// XP and level calculations
export const calculateLevel = (totalXP) => {
  let level = 1;
  let xpRequired = GAMIFICATION.LEVEL_XP_BASE;
  let xpAccumulated = 0;

  while (totalXP >= xpAccumulated + xpRequired) {
    xpAccumulated += xpRequired;
    level++;
    xpRequired = Math.floor(xpRequired * GAMIFICATION.LEVEL_XP_MULTIPLIER);
  }

  return {
    level,
    currentLevelXP: totalXP - xpAccumulated,
    xpForNext: xpRequired,
    progress: ((totalXP - xpAccumulated) / xpRequired) * 100,
  };
};

// Health calculations
export const calculateHealth = (tasksCompleted, daysSinceLastActivity) => {
  const baseHealth = tasksCompleted * GAMIFICATION.HEALTH_PER_TASK;
  const healthLoss = daysSinceLastActivity * GAMIFICATION.HEALTH_LOSS_PER_DAY;
  return Math.max(
    0,
    Math.min(GAMIFICATION.MAX_HEALTH, baseHealth - healthLoss),
  );
};

// Streak calculations
export const calculateStreak = (activities) => {
  if (!activities || activities.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < activities.length; i++) {
    const activityDate = new Date(activities[i].date);
    activityDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === i) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Text utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

export const validatePassword = (password) => {
  return {
    length: password.length >= 6,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };
};

// Local storage utilities with error handling
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },
};

// Image utilities
export const getImageUrl = (imagePath, size = "medium") => {
  if (!imagePath) return "/images/placeholder.jpg";

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) return imagePath;

  // Add size prefix for optimized images
  const sizePrefix =
    size === "small" ? "thumb_" : size === "large" ? "full_" : "";
  return `/uploads/${sizePrefix}${imagePath}`;
};

export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(resolve, "image/jpeg", quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Color utilities
export const generateAvatarGradient = (name) => {
  const colors = [
    "from-pink-400 to-red-400",
    "from-purple-400 to-pink-400",
    "from-blue-400 to-purple-400",
    "from-green-400 to-blue-400",
    "from-yellow-400 to-green-400",
    "from-red-400 to-yellow-400",
  ];

  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
};

// Device and browser utilities
export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const isOnline = () => {
  return navigator.onLine;
};

export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenWidth: screen.width,
    screenHeight: screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  };
};

// Performance utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Array utilities
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Time utilities
export const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return "Just now";
};

export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export default {
  formatDate,
  formatCurrency,
  formatNumber,
  calculateLevel,
  calculateHealth,
  calculateStreak,
  truncateText,
  capitalizeFirst,
  slugify,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  storage,
  getImageUrl,
  compressImage,
  generateAvatarGradient,
  getContrastColor,
  isMobile,
  isOnline,
  getDeviceInfo,
  debounce,
  throttle,
  shuffleArray,
  groupBy,
  timeAgo,
  formatDuration,
};
