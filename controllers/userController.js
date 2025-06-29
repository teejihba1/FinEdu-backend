/**
 * User Controller
 * Handles user management and admin functions
 */

const User = require('../models/User');
const Avatar = require('../models/Avatar');
const { generatePagination } = require('../utils/helpers');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, USER_ROLES } = require('../utils/constants');

module.exports = {
  /**
   * @route GET /api/users
   * @desc Get all users (admin/teacher)
   */
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const role = req.query.role || '';

      let query = { isActive: true };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) {
        query.role = role;
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const pagination = generatePagination(page, limit, total);

      res.status(200).json({
        users,
        pagination
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get users', message: err.message });
    }
  },

  /**
   * @route GET /api/users/:id
   * @desc Get user by ID
   */
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      // Check if user can access this profile
      if (req.user.role === USER_ROLES.STUDENT && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      }

      res.status(200).json({ user: user.getPublicProfile() });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user', message: err.message });
    }
  },

  /**
   * @route PUT /api/users/:id
   * @desc Update user by ID
   */
  updateUser: async (req, res) => {
    try {
      const { name, email, role, language, profile, isActive } = req.body;
      
      // Check if user can update this profile
      if (req.user.role === USER_ROLES.STUDENT && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (role && req.user.role === USER_ROLES.ADMIN) user.role = role;
      if (language) user.language = language;
      if (profile) user.profile = { ...user.profile, ...profile };
      if (isActive !== undefined && req.user.role === USER_ROLES.ADMIN) user.isActive = isActive;

      await user.save();
      res.status(200).json({
        message: 'User updated successfully',
        user: user.getPublicProfile()
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user', message: err.message });
    }
  },

  /**
   * @route DELETE /api/users/:id
   * @desc Delete user by ID
   */
  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      // Soft delete - set isActive to false
      user.isActive = false;
      await user.save();

      // Also delete associated avatar
      await Avatar.findOneAndDelete({ userId: user._id });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user', message: err.message });
    }
  },

  /**
   * @route GET /api/users/students
   * @desc Get all students (teacher)
   */
  getAllStudents: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      let query = { role: USER_ROLES.STUDENT, isActive: true };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await User.countDocuments(query);
      const students = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const pagination = generatePagination(page, limit, total);

      res.status(200).json({
        students,
        pagination
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get students', message: err.message });
    }
  },

  /**
   * @route GET /api/users/teachers
   * @desc Get all teachers (admin)
   */
  getAllTeachers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      let query = { role: USER_ROLES.TEACHER, isActive: true };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await User.countDocuments(query);
      const teachers = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const pagination = generatePagination(page, limit, total);

      res.status(200).json({
        teachers,
        pagination
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get teachers', message: err.message });
    }
  }
}; 