const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

// @route   POST /api/games/session
// @desc    Start new game session
router.post('/session', auth, gameController.startSession);

// @route   PUT /api/games/session/:id
// @desc    Update game session
router.put('/session/:id', auth, gameController.updateSession);

// @route   POST /api/games/session/:id/complete
// @desc    Complete game session
router.post('/session/:id/complete', auth, gameController.completeSession);

// @route   GET /api/games/leaderboard/:gameType
// @desc    Get game leaderboard
router.get('/leaderboard/:gameType', auth, gameController.getLeaderboard);

// @route   GET /api/games/stats
// @desc    Get user's game statistics
router.get('/stats', auth, gameController.getUserStats);

module.exports = router; 