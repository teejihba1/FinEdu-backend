/**
 * Chatbot Controller
 * Handles AI chatbot proxy and chat history
 */

const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');
const { ERROR_MESSAGES } = require('../utils/constants');

module.exports = {
  /**
   * @route POST /api/chatbot/ask
   * @desc Send question to AI chatbot
   */
  ask: async (req, res) => {
    try {
      const { question, context, language } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      // Prepare request to AI service
      const aiRequest = {
        question,
        context: context || '',
        language: language || req.user.language || 'en',
        userId: req.user._id.toString(),
        userRole: req.user.role
      };

      // Call AI service
      let aiResponse;
      try {
        const response = await axios.post(process.env.CHATBOT_API_URL, aiRequest, {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        aiResponse = response.data;
      } catch (aiError) {
        console.error('AI service error:', aiError.message);
        // Fallback response if AI service is unavailable
        aiResponse = {
          answer: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact support if the issue persists.",
          confidence: 0.5,
          sources: []
        };
      }

      // Save chat history
      const chatEntry = await ChatHistory.create({
        userId: req.user._id,
        question,
        answer: aiResponse.answer,
        context,
        language: language || req.user.language,
        confidence: aiResponse.confidence || 0.5,
        sources: aiResponse.sources || [],
        metadata: {
          userRole: req.user.role,
          timestamp: new Date()
        }
      });

      res.status(200).json({
        answer: aiResponse.answer,
        confidence: aiResponse.confidence || 0.5,
        sources: aiResponse.sources || [],
        chatId: chatEntry._id
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process question', message: err.message });
    }
  },

  /**
   * @route GET /api/chatbot/history
   * @desc Get chat history
   */
  getHistory: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const language = req.query.language || '';

      let query = { userId: req.user._id };
      if (language) query.language = language;

      const total = await ChatHistory.countDocuments(query);
      const history = await ChatHistory.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-metadata');

      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      };

      res.status(200).json({
        history,
        pagination
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get chat history', message: err.message });
    }
  }
}; 