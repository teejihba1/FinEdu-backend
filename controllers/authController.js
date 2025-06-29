/**
 * Authentication Controller
 * Handles user registration, login, logout, profile, and avatar upload
 */

const User = require('../models/User');
const Avatar = require('../models/Avatar');
const { hashPassword, comparePassword } = require('../utils/helpers');
const { generateToken } = require('../config/jwt');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, USER_ROLES } = require('../utils/constants');

module.exports = {
  /**
   * @route POST /api/auth/register
   * @desc Register a new user
   */
  register: async (req, res) => {
    try {
      const { name, email, password, role, language, profile } = req.body;
      // Check for existing user
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: ERROR_MESSAGES.DUPLICATE_EMAIL });
      }
      // Hash password
      const hashed = await hashPassword(password);
      // Create user
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: role || USER_ROLES.STUDENT,
        language: language || 'en',
        profile
      });
      // Create avatar for gamification
      await Avatar.create({ userId: user._id });
      // Generate JWT
      const token = generateToken(user._id, user.role);
      // Return user (without password) and token
      res.status(201).json({
        message: SUCCESS_MESSAGES.USER_REGISTERED,
        user: user.getPublicProfile(),
        token
      });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed', message: err.message });
    }
  },

  /**
   * @route POST /api/auth/login
   * @desc Login user and return JWT
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
      }
      // Generate JWT
      const token = generateToken(user._id, user.role);
      // Optionally set cookie (for web clients)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      res.status(200).json({
        message: SUCCESS_MESSAGES.USER_LOGGED_IN,
        user: user.getPublicProfile(),
        token
      });
    } catch (err) {
      res.status(500).json({ error: 'Login failed', message: err.message });
    }
  },

  /**
   * @route POST /api/auth/logout
   * @desc Logout user (clear cookie/token)
   */
  logout: async (req, res) => {
    try {
      res.clearCookie('token');
      res.status(200).json({ message: SUCCESS_MESSAGES.USER_LOGGED_OUT });
    } catch (err) {
      res.status(500).json({ error: 'Logout failed', message: err.message });
    }
  },

  /**
   * @route GET /api/auth/profile
   * @desc Get current user profile
   */
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }
      res.status(200).json({ user: user.getPublicProfile() });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get profile', message: err.message });
    }
  },

  /**
   * @route PUT /api/auth/profile
   * @desc Update user profile
   */
  updateProfile: async (req, res) => {
    try {
      const { name, language, profile } = req.body;
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }
      // Update fields
      if (name) user.name = name;
      if (language) user.language = language;
      if (profile) user.profile = { ...user.profile, ...profile };
      
      await user.save();
      res.status(200).json({
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
        user: user.getPublicProfile()
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile', message: err.message });
    }
  },

  /**
   * @route POST /api/auth/upload-avatar
   * @desc Upload user avatar
   */
  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }
      // Update avatar path
      user.avatar = req.file.filename;
      await user.save();
      res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatar: user.avatarUrl
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to upload avatar', message: err.message });
    }
  }
}; 