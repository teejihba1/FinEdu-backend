/**
 * Game Controller
 * Handles game session management and leaderboards
 */

const GameSession = require('../models/GameSession');
const Avatar = require('../models/Avatar');
const { calculateXP } = require('../utils/helpers');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, GAME_TYPES } = require('../utils/constants');

module.exports = {
  /**
   * @route POST /api/games/session
   * @desc Start new game session
   */
  startSession: async (req, res) => {
    try {
      const { gameType, difficulty, level } = req.body;
      
      if (!Object.values(GAME_TYPES).includes(gameType)) {
        return res.status(400).json({ error: 'Invalid game type' });
      }

      const session = await GameSession.create({
        userId: req.user._id,
        gameType,
        difficulty: difficulty || 'medium',
        level: level || 1,
        startedAt: new Date()
      });

      res.status(201).json({
        message: SUCCESS_MESSAGES.GAME_STARTED,
        session
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to start game session', message: err.message });
    }
  },

  /**
   * @route PUT /api/games/session/:id
   * @desc Update game session
   */
  updateSession: async (req, res) => {
    try {
      const { score, gameData } = req.body;
      const session = await GameSession.findById(req.params.id);
      
      if (!session) {
        return res.status(404).json({ error: ERROR_MESSAGES.GAME_NOT_FOUND });
      }

      // Check if user owns this session
      if (session.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      }

      // Update session
      if (score !== undefined) session.score = score;
      if (gameData) session.gameData = gameData;
      
      await session.save();

      res.status(200).json({
        message: 'Game session updated',
        session
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update game session', message: err.message });
    }
  },

  /**
   * @route POST /api/games/session/:id/complete
   * @desc Complete game session
   */
  completeSession: async (req, res) => {
    try {
      const { score, achievements, gameData, accuracy, timeBonus, streakBonus } = req.body;
      const session = await GameSession.findById(req.params.id);
      
      if (!session) {
        return res.status(404).json({ error: ERROR_MESSAGES.GAME_NOT_FOUND });
      }

      // Check if user owns this session
      if (session.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      }

      // Complete the session
      const finalScore = score || session.score || 0;
      const xpEarned = calculateXP('game', session.difficulty, 20);
      
      await session.complete(finalScore, xpEarned, achievements || []);

      // Update session with additional data
      if (gameData) session.gameData = gameData;
      if (accuracy !== undefined) session.accuracy = accuracy;
      if (timeBonus !== undefined) session.timeBonus = timeBonus;
      if (streakBonus !== undefined) session.streakBonus = streakBonus;
      
      await session.save();

      // Update user's avatar
      const avatar = await Avatar.findOne({ userId: req.user._id });
      if (avatar) {
        await avatar.addXP(xpEarned);
        avatar.totalGamesPlayed += 1;
        
        // Add achievements
        if (achievements) {
          for (const achievement of achievements) {
            await avatar.addAchievement(achievement);
          }
        }
        
        await avatar.save();
      }

      res.status(200).json({
        message: SUCCESS_MESSAGES.GAME_COMPLETED,
        session: session.getStats(),
        xpEarned,
        avatar: avatar ? avatar.getStats() : null
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to complete game session', message: err.message });
    }
  },

  /**
   * @route GET /api/games/leaderboard/:gameType
   * @desc Get game leaderboard
   */
  getLeaderboard: async (req, res) => {
    try {
      const { gameType } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const timeframe = req.query.timeframe || 'all'; // 'all', 'week', 'month'

      if (!Object.values(GAME_TYPES).includes(gameType)) {
        return res.status(400).json({ error: 'Invalid game type' });
      }

      let dateFilter = {};
      if (timeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { completedAt: { $gte: weekAgo } };
      } else if (timeframe === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { completedAt: { $gte: monthAgo } };
      }

      const leaderboard = await GameSession.getLeaderboard(gameType, limit);
      
      // Filter by timeframe if needed
      let filteredLeaderboard = leaderboard;
      if (timeframe !== 'all') {
        filteredLeaderboard = leaderboard.filter(session => 
          session.completedAt >= dateFilter.completedAt.$gte
        );
      }

      res.status(200).json({
        gameType,
        timeframe,
        leaderboard: filteredLeaderboard
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get leaderboard', message: err.message });
    }
  },

  /**
   * @route GET /api/games/stats
   * @desc Get user's game statistics
   */
  getUserStats: async (req, res) => {
    try {
      const userId = req.user._id;
      
      // Get user's best scores for each game type
      const bestScores = await GameSession.getUserBestScores(userId);
      
      // Get recent high scores
      const recentHighScores = await GameSession.getRecentHighScores(5);
      
      // Get user's game history
      const gameHistory = await GameSession.getUserHistory(userId, 10);
      
      // Get avatar stats
      const avatar = await Avatar.findOne({ userId });
      const avatarStats = avatar ? avatar.getStats() : null;

      res.status(200).json({
        bestScores,
        recentHighScores,
        gameHistory,
        avatarStats
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get game statistics', message: err.message });
    }
  }
}; 