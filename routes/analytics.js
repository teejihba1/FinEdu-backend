const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/analytics/student/:id
// @desc    Get student progress
router.get('/student/:id', auth, roleCheck(['teacher', 'admin']), analyticsController.getStudentProgress);

// @route   GET /api/analytics/class-overview
// @desc    Get class progress (teachers)
router.get('/class-overview', auth, roleCheck(['teacher', 'admin']), analyticsController.getClassOverview);

// @route   GET /api/analytics/export-report
// @desc    Export progress report
router.get('/export-report', auth, roleCheck(['teacher', 'admin']), analyticsController.exportReport);

module.exports = router; 