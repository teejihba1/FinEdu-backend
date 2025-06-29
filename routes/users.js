const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/users
// @desc    Get all users (admin/teacher)
router.get('/', auth, roleCheck(['admin', 'teacher']), userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
router.get('/:id', auth, userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user by ID
router.put('/:id', auth, userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user by ID
router.delete('/:id', auth, roleCheck('admin'), userController.deleteUser);

// @route   GET /api/users/students
// @desc    Get all students (teacher)
router.get('/students', auth, roleCheck(['teacher', 'admin']), userController.getAllStudents);

// @route   GET /api/users/teachers
// @desc    Get all teachers (admin)
router.get('/teachers', auth, roleCheck('admin'), userController.getAllTeachers);

module.exports = router; 