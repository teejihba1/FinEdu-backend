const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
// const validate = require('../middleware/validation');
// const { lessonSchema } = require('../validation/lesson');

// @route   GET /api/lessons
// @desc    Get all lessons (with filters)
router.get('/', auth, lessonController.getAllLessons);

// @route   GET /api/lessons/:id
// @desc    Get lesson by ID
router.get('/:id', auth, lessonController.getLessonById);

// @route   POST /api/lessons
// @desc    Create a new lesson (teachers only)
router.post('/', auth, roleCheck('teacher'), /*validate(lessonSchema),*/ lessonController.createLesson);

// @route   PUT /api/lessons/:id
// @desc    Update lesson by ID (teachers only)
router.put('/:id', auth, roleCheck('teacher'), /*validate(lessonSchema),*/ lessonController.updateLesson);

// @route   DELETE /api/lessons/:id
// @desc    Delete lesson by ID (teachers only)
router.delete('/:id', auth, roleCheck('teacher'), lessonController.deleteLesson);

// @route   POST /api/lessons/:id/complete
// @desc    Mark lesson as completed
router.post('/:id/complete', auth, lessonController.completeLesson);

module.exports = router; 