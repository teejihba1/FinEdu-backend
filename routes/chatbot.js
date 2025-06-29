const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

// @route   POST /api/chatbot/ask
// @desc    Send question to AI chatbot
router.post('/ask', auth, chatbotController.ask);

// @route   GET /api/chatbot/history
// @desc    Get chat history
router.get('/history', auth, chatbotController.getHistory);

module.exports = router; 