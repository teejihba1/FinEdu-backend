import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { avatarAPI, gameAPI } from "../utils/api";
import {
  calculateLevel,
  calculateHealth,
  calculateStreak,
} from "../utils/helpers";
import { GAMIFICATION } from "../utils/constants";
import { toast } from "react-hot-toast";

// Game context
const GameContext = createContext();

// Game actions
const GAME_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_AVATAR: "SET_AVATAR",
  SET_STATS: "SET_STATS",
  SET_INVENTORY: "SET_INVENTORY",
  SET_ACHIEVEMENTS: "SET_ACHIEVEMENTS",
  ADD_XP: "ADD_XP",
  ADD_HEALTH: "ADD_HEALTH",
  LOSE_HEALTH: "LOSE_HEALTH",
  UPDATE_STREAK: "UPDATE_STREAK",
  UNLOCK_ACHIEVEMENT: "UNLOCK_ACHIEVEMENT",
  EQUIP_ITEM: "EQUIP_ITEM",
  PURCHASE_ITEM: "PURCHASE_ITEM",
  LEVEL_UP: "LEVEL_UP",
  SET_GAME_SESSION: "SET_GAME_SESSION",
  UPDATE_HIGH_SCORES: "UPDATE_HIGH_SCORES",
};

// Initial state
const initialState = {
  isLoading: false,
  avatar: {
    id: null,
    userId: null,
    level: 1,
    xp: 0,
    health: 100,
    streak: 0,
    appearance: {
      skinTone: "#FDBCB4",
      hairColor: "#2F1B14",
      clothingColor: "#4ECDC4",
      accessories: [],
    },
    equipped: {},
    lastActivity: null,
  },
  inventory: [],
  achievements: [],
  stats: {
    totalXP: 0,
    lessonsCompleted: 0,
    tasksCompleted: 0,
    gamesPlayed: 0,
    dayStreak: 0,
    longestStreak: 0,
  },
  gameSession: null,
  highScores: {},
  levelUpAnimation: false,
};

// Game reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case GAME_ACTIONS.SET_AVATAR:
      return {
        ...state,
        avatar: action.payload,
      };

    case GAME_ACTIONS.SET_STATS:
      return {
        ...state,
        stats: action.payload,
      };

    case GAME_ACTIONS.SET_INVENTORY:
      return {
        ...state,
        inventory: action.payload,
      };

    case GAME_ACTIONS.SET_ACHIEVEMENTS:
      return {
        ...state,
        achievements: action.payload,
      };

    case GAME_ACTIONS.ADD_XP:
      const newXP = state.avatar.xp + action.payload;
      const levelInfo = calculateLevel(newXP);
      const didLevelUp = levelInfo.level > state.avatar.level;

      return {
        ...state,
        avatar: {
          ...state.avatar,
          xp: newXP,
          level: levelInfo.level,
        },
        stats: {
          ...state.stats,
          totalXP: newXP,
        },
        levelUpAnimation: didLevelUp,
      };

    case GAME_ACTIONS.ADD_HEALTH:
      return {
        ...state,
        avatar: {
          ...state.avatar,
          health: Math.min(
            GAMIFICATION.MAX_HEALTH,
            state.avatar.health + action.payload,
          ),
        },
      };

    case GAME_ACTIONS.LOSE_HEALTH:
      return {
        ...state,
        avatar: {
          ...state.avatar,
          health: Math.max(0, state.avatar.health - action.payload),
        },
      };

    case GAME_ACTIONS.UPDATE_STREAK:
      return {
        ...state,
        avatar: {
          ...state.avatar,
          streak: action.payload,
        },
        stats: {
          ...state.stats,
          dayStreak: action.payload,
          longestStreak: Math.max(state.stats.longestStreak, action.payload),
        },
      };

    case GAME_ACTIONS.UNLOCK_ACHIEVEMENT:
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
      };

    case GAME_ACTIONS.EQUIP_ITEM:
      return {
        ...state,
        avatar: {
          ...state.avatar,
          equipped: {
            ...state.avatar.equipped,
            [action.payload.slot]: action.payload.item,
          },
        },
      };

    case GAME_ACTIONS.PURCHASE_ITEM:
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
      };

    case GAME_ACTIONS.LEVEL_UP:
      return {
        ...state,
        levelUpAnimation: false,
      };

    case GAME_ACTIONS.SET_GAME_SESSION:
      return {
        ...state,
        gameSession: action.payload,
      };

    case GAME_ACTIONS.UPDATE_HIGH_SCORES:
      return {
        ...state,
        highScores: {
          ...state.highScores,
          [action.payload.gameType]: action.payload.score,
        },
      };

    default:
      return state;
  }
};

// Game provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load avatar and game data on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAvatarData();
      loadGameStats();
    }
  }, [isAuthenticated, user]);

  // Load avatar data
  const loadAvatarData = async () => {
    try {
      dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: true });

      const [avatarResponse, inventoryResponse] = await Promise.all([
        avatarAPI.getAvatar(),
        avatarAPI.getInventory(),
      ]);

      dispatch({ type: GAME_ACTIONS.SET_AVATAR, payload: avatarResponse.data });
      dispatch({
        type: GAME_ACTIONS.SET_INVENTORY,
        payload: inventoryResponse.data,
      });
    } catch (error) {
      console.error("Failed to load avatar data:", error);
    } finally {
      dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Load game statistics
  const loadGameStats = async () => {
    try {
      const response = await gameAPI.getUserGameStats();
      dispatch({ type: GAME_ACTIONS.SET_STATS, payload: response.data });
    } catch (error) {
      console.error("Failed to load game stats:", error);
    }
  };

  // Award XP for activities
  const awardXP = async (amount, activity) => {
    try {
      dispatch({ type: GAME_ACTIONS.ADD_XP, payload: amount });

      // Update avatar on server
      await avatarAPI.updateAvatar({
        xp: state.avatar.xp + amount,
        lastActivity: new Date(),
      });

      // Show XP gain notification
      toast.success(`+${amount} XP from ${activity}!`, {
        icon: "⚡",
        duration: 3000,
      });

      // Check for level up
      const newLevel = calculateLevel(state.avatar.xp + amount).level;
      if (newLevel > state.avatar.level) {
        handleLevelUp(newLevel);
      }
    } catch (error) {
      console.error("Failed to award XP:", error);
    }
  };

  // Award health for completing tasks
  const awardHealth = async (amount, activity) => {
    try {
      dispatch({ type: GAME_ACTIONS.ADD_HEALTH, payload: amount });

      // Update avatar on server
      await avatarAPI.updateAvatar({
        health: Math.min(GAMIFICATION.MAX_HEALTH, state.avatar.health + amount),
      });

      // Show health gain notification
      toast.success(`+${amount} Health from ${activity}!`, {
        icon: "❤️",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to award health:", error);
    }
  };

  // Reduce health for inactivity
  const loseHealth = async (amount) => {
    try {
      dispatch({ type: GAME_ACTIONS.LOSE_HEALTH, payload: amount });

      // Update avatar on server
      await avatarAPI.updateAvatar({
        health: Math.max(0, state.avatar.health - amount),
      });

      // Show health loss notification
      if (state.avatar.health - amount <= 20) {
        toast.error("Low health! Complete tasks to recover.", {
          icon: "⚠️",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Failed to reduce health:", error);
    }
  };

  // Update streak
  const updateStreak = async (activities) => {
    try {
      const newStreak = calculateStreak(activities);
      dispatch({ type: GAME_ACTIONS.UPDATE_STREAK, payload: newStreak });

      // Update avatar on server
      await avatarAPI.updateAvatar({
        streak: newStreak,
      });

      // Show streak notification
      if (newStreak > state.avatar.streak) {
        toast.success(`🔥 ${newStreak} day streak!`, {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to update streak:", error);
    }
  };

  // Handle level up
  const handleLevelUp = (newLevel) => {
    dispatch({ type: GAME_ACTIONS.LEVEL_UP });

    // Show level up celebration
    toast.success(`🎉 Level Up! Welcome to Level ${newLevel}!`, {
      duration: 5000,
    });

    // Award bonus XP for leveling up
    const bonus = newLevel * 10;
    setTimeout(() => {
      toast.success(`Bonus: +${bonus} XP for reaching Level ${newLevel}!`, {
        icon: "🎁",
        duration: 3000,
      });
    }, 1000);
  };

  // Purchase item from shop
  const purchaseItem = async (itemId) => {
    try {
      const response = await avatarAPI.purchaseItem(itemId);
      dispatch({ type: GAME_ACTIONS.PURCHASE_ITEM, payload: response.data });

      toast.success("Item purchased successfully!", {
        icon: "🛍️",
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to purchase item";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Equip item
  const equipItem = async (itemId, slot) => {
    try {
      const response = await avatarAPI.equipItem(itemId, slot);
      dispatch({
        type: GAME_ACTIONS.EQUIP_ITEM,
        payload: { item: response.data, slot },
      });

      toast.success("Item equipped!", {
        icon: "✨",
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to equip item";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Start game session
  const startGameSession = async (gameType, options = {}) => {
    try {
      const response = await gameAPI.startGame(gameType, options);
      dispatch({ type: GAME_ACTIONS.SET_GAME_SESSION, payload: response.data });
      return { success: true, session: response.data };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to start game";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Complete game session
  const completeGameSession = async (result) => {
    try {
      if (!state.gameSession) {
        throw new Error("No active game session");
      }

      const response = await gameAPI.submitGameResult(
        state.gameSession.id,
        result,
      );

      // Award XP and update stats
      await awardXP(response.data.xpEarned, "game completion");

      // Update high scores
      if (response.data.isHighScore) {
        dispatch({
          type: GAME_ACTIONS.UPDATE_HIGH_SCORES,
          payload: {
            gameType: state.gameSession.gameType,
            score: result.score,
          },
        });

        toast.success("New high score! 🏆", {
          duration: 4000,
        });
      }

      // Clear game session
      dispatch({ type: GAME_ACTIONS.SET_GAME_SESSION, payload: null });

      return { success: true, result: response.data };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to complete game";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update avatar appearance
  const updateAppearance = async (appearanceData) => {
    try {
      const response = await avatarAPI.updateAvatar({
        appearance: { ...state.avatar.appearance, ...appearanceData },
      });

      dispatch({ type: GAME_ACTIONS.SET_AVATAR, payload: response.data });

      toast.success("Avatar updated!", {
        icon: "👤",
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to update avatar";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get level progress
  const getLevelProgress = () => {
    return calculateLevel(state.avatar.xp);
  };

  // Get health status
  const getHealthStatus = () => {
    const { health } = state.avatar;
    if (health >= 80) return { status: "excellent", color: "green" };
    if (health >= 60) return { status: "good", color: "yellow" };
    if (health >= 40) return { status: "fair", color: "orange" };
    if (health >= 20) return { status: "poor", color: "red" };
    return { status: "critical", color: "red" };
  };

  // Check if user can afford item
  const canAffordItem = (itemPrice) => {
    return state.avatar.xp >= itemPrice;
  };

  const value = {
    ...state,
    awardXP,
    awardHealth,
    loseHealth,
    updateStreak,
    purchaseItem,
    equipItem,
    startGameSession,
    completeGameSession,
    updateAppearance,
    getLevelProgress,
    getHealthStatus,
    canAffordItem,
    loadAvatarData,
    loadGameStats,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export default GameContext;
