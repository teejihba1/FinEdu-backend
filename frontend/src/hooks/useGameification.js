import { useContext } from "react";
import { useGame } from "../context/GameContext";
import { GAMIFICATION } from "../utils/constants";
import { calculateLevel } from "../utils/helpers";

// Custom hook for gamification features
export const useGameification = () => {
  const gameContext = useGame();

  // Calculate XP needed for next level
  const getXPForNextLevel = (currentXP) => {
    const { level, xpForNext, currentLevelXP } = calculateLevel(currentXP);
    return {
      level,
      currentLevelXP,
      xpForNext,
      progress: (currentLevelXP / xpForNext) * 100,
      totalNeeded: currentLevelXP + xpForNext,
    };
  };

  // Get XP multiplier based on streak
  const getStreakMultiplier = (streak) => {
    if (streak >= 30) return 2.0; // 100% bonus for 30+ days
    if (streak >= 14) return 1.5; // 50% bonus for 2+ weeks
    if (streak >= 7) return 1.3; // 30% bonus for 1+ week
    if (streak >= 3) return 1.2; // 20% bonus for 3+ days
    return 1.0; // No bonus
  };

  // Calculate XP reward for activity
  const calculateXPReward = (activityType, params = {}) => {
    let baseXP = 0;

    switch (activityType) {
      case "lesson_complete":
        baseXP = GAMIFICATION.XP_PER_LESSON;
        // Bonus for difficulty
        if (params.difficulty === "intermediate") baseXP *= 1.2;
        if (params.difficulty === "advanced") baseXP *= 1.5;
        break;

      case "task_complete":
        baseXP = GAMIFICATION.XP_PER_TASK;
        // Bonus for task type
        if (params.type === "project") baseXP *= 2;
        if (params.type === "practical_exercise") baseXP *= 1.5;
        break;

      case "game_complete":
        baseXP = GAMIFICATION.XP_PER_GAME;
        // Bonus for performance
        if (params.score >= 90) baseXP *= 1.5;
        else if (params.score >= 80) baseXP *= 1.2;
        break;

      case "quiz_correct":
        baseXP = GAMIFICATION.XP_PER_QUIZ_CORRECT;
        break;

      case "first_login_today":
        baseXP = 10;
        break;

      case "achievement_unlock":
        baseXP = params.achievementPoints || 100;
        break;

      default:
        baseXP = 10;
    }

    // Apply streak multiplier
    const streakMultiplier = getStreakMultiplier(gameContext.avatar.streak);
    return Math.round(baseXP * streakMultiplier);
  };

  // Get achievement progress
  const getAchievementProgress = () => {
    const { stats, avatar } = gameContext;

    const achievements = [
      {
        id: "first_lesson",
        name: "First Steps",
        description: "Complete your first lesson",
        icon: "📚",
        unlocked: stats.lessonsCompleted >= 1,
        progress: Math.min(stats.lessonsCompleted, 1),
        total: 1,
        xpReward: 50,
      },
      {
        id: "lesson_master",
        name: "Lesson Master",
        description: "Complete 10 lessons",
        icon: "🎓",
        unlocked: stats.lessonsCompleted >= 10,
        progress: Math.min(stats.lessonsCompleted, 10),
        total: 10,
        xpReward: 200,
      },
      {
        id: "dedicated_learner",
        name: "Dedicated Learner",
        description: "Maintain a 7-day streak",
        icon: "🔥",
        unlocked: stats.longestStreak >= 7,
        progress: Math.min(stats.longestStreak, 7),
        total: 7,
        xpReward: 150,
      },
      {
        id: "task_warrior",
        name: "Task Warrior",
        description: "Complete 25 tasks",
        icon: "⚔️",
        unlocked: stats.tasksCompleted >= 25,
        progress: Math.min(stats.tasksCompleted, 25),
        total: 25,
        xpReward: 300,
      },
      {
        id: "game_champion",
        name: "Game Champion",
        description: "Play 15 games",
        icon: "🏆",
        unlocked: stats.gamesPlayed >= 15,
        progress: Math.min(stats.gamesPlayed, 15),
        total: 15,
        xpReward: 250,
      },
      {
        id: "level_5",
        name: "Rising Star",
        description: "Reach level 5",
        icon: "⭐",
        unlocked: avatar.level >= 5,
        progress: Math.min(avatar.level, 5),
        total: 5,
        xpReward: 300,
      },
      {
        id: "level_10",
        name: "Expert",
        description: "Reach level 10",
        icon: "💎",
        unlocked: avatar.level >= 10,
        progress: Math.min(avatar.level, 10),
        total: 10,
        xpReward: 500,
      },
      {
        id: "perfect_health",
        name: "Perfect Health",
        description: "Maintain 100% health for 3 days",
        icon: "💪",
        unlocked: false, // This would need special tracking
        progress: 0,
        total: 3,
        xpReward: 200,
      },
    ];

    return achievements;
  };

  // Get next achievement to work towards
  const getNextAchievement = () => {
    const achievements = getAchievementProgress();
    const unlockedAchievements = achievements.filter((a) => !a.unlocked);

    if (unlockedAchievements.length === 0) return null;

    // Sort by progress percentage (closest to completion first)
    return unlockedAchievements.sort((a, b) => {
      const aProgress = (a.progress / a.total) * 100;
      const bProgress = (b.progress / b.total) * 100;
      return bProgress - aProgress;
    })[0];
  };

  // Get health recommendations
  const getHealthRecommendations = () => {
    const { health } = gameContext.avatar;
    const recommendations = [];

    if (health < 30) {
      recommendations.push({
        type: "urgent",
        message:
          "Your health is critically low! Complete some tasks to recover.",
        action: "Complete tasks",
        icon: "🚨",
      });
    } else if (health < 60) {
      recommendations.push({
        type: "warning",
        message: "Your health is getting low. Consider completing daily tasks.",
        action: "View tasks",
        icon: "⚠️",
      });
    } else if (health < 90) {
      recommendations.push({
        type: "info",
        message:
          "Keep up the good work! Complete more tasks to boost your health.",
        action: "Continue learning",
        icon: "ℹ️",
      });
    }

    return recommendations;
  };

  // Get learning recommendations based on progress
  const getLearningRecommendations = () => {
    const { avatar, stats } = gameContext;
    const recommendations = [];

    // Streak recommendations
    if (avatar.streak === 0) {
      recommendations.push({
        type: "streak",
        title: "Start Your Streak",
        message:
          "Complete a lesson or task today to start building your learning streak!",
        action: "View lessons",
        priority: "high",
      });
    } else if (avatar.streak < 7) {
      recommendations.push({
        type: "streak",
        title: "Build Your Streak",
        message: `You're on a ${avatar.streak}-day streak! Keep it going to earn bonus XP.`,
        action: "Continue streak",
        priority: "medium",
      });
    }

    // Level recommendations
    const levelProgress = getXPForNextLevel(avatar.xp);
    if (levelProgress.progress > 80) {
      recommendations.push({
        type: "level",
        title: "Almost Level Up!",
        message: `You need just ${levelProgress.xpForNext - levelProgress.currentLevelXP} more XP to reach level ${levelProgress.level + 1}!`,
        action: "Earn XP",
        priority: "high",
      });
    }

    // Activity recommendations
    if (stats.lessonsCompleted < 5) {
      recommendations.push({
        type: "lesson",
        title: "Keep Learning",
        message: "Complete more lessons to unlock new topics and earn XP!",
        action: "Browse lessons",
        priority: "medium",
      });
    }

    if (stats.gamesPlayed < 3) {
      recommendations.push({
        type: "game",
        title: "Try the Games",
        message: "Practice your financial skills with fun, interactive games!",
        action: "Play games",
        priority: "low",
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Format XP display
  const formatXP = (xp) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

  // Get rank based on level
  const getRank = (level) => {
    if (level >= 50)
      return { name: "Financial Master", icon: "👑", color: "gold" };
    if (level >= 40)
      return { name: "Money Expert", icon: "💎", color: "purple" };
    if (level >= 30) return { name: "Budget Pro", icon: "🏆", color: "gold" };
    if (level >= 20)
      return { name: "Savings Star", icon: "⭐", color: "yellow" };
    if (level >= 15)
      return { name: "Finance Student", icon: "🎓", color: "blue" };
    if (level >= 10)
      return { name: "Money Learner", icon: "📚", color: "green" };
    if (level >= 5)
      return { name: "Budget Beginner", icon: "🌱", color: "green" };
    return { name: "New Learner", icon: "👶", color: "gray" };
  };

  // Check if user can perform action (based on health, level, etc.)
  const canPerformAction = (actionType, requirements = {}) => {
    const { avatar } = gameContext;

    // Health requirements
    if (requirements.minHealth && avatar.health < requirements.minHealth) {
      return {
        canPerform: false,
        reason: `You need at least ${requirements.minHealth} health to perform this action.`,
        suggestion: "Complete some tasks to restore your health.",
      };
    }

    // Level requirements
    if (requirements.minLevel && avatar.level < requirements.minLevel) {
      return {
        canPerform: false,
        reason: `You need to be at least level ${requirements.minLevel} to perform this action.`,
        suggestion: "Complete more lessons and tasks to level up.",
      };
    }

    // XP requirements
    if (requirements.minXP && avatar.xp < requirements.minXP) {
      return {
        canPerform: false,
        reason: `You need at least ${requirements.minXP} XP to perform this action.`,
        suggestion: "Earn more XP by completing activities.",
      };
    }

    return { canPerform: true };
  };

  return {
    ...gameContext,
    getXPForNextLevel,
    getStreakMultiplier,
    calculateXPReward,
    getAchievementProgress,
    getNextAchievement,
    getHealthRecommendations,
    getLearningRecommendations,
    formatXP,
    getRank,
    canPerformAction,
  };
};

export default useGameification;
