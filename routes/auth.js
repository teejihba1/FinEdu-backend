const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validation');
const { avatarUpload } = require('../config/multer');
const auth = require('../middleware/auth');

// Joi schemas (to be defined in validation layer)
// const { registerSchema, loginSchema, updateProfileSchema } = require('../validation/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', /*validate(registerSchema),*/ authController.register);

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', /*validate(loginSchema),*/ authController.login);

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', auth, authController.logout);

// @route   GET /api/auth/profile
// @desc    Get current user profile
router.get('/profile', auth, authController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', auth, /*validate(updateProfileSchema),*/ authController.updateProfile);

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
router.post('/upload-avatar', auth, avatarUpload.single('avatar'), authController.uploadAvatar);

module.exports = router; 