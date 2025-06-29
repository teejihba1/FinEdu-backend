const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
// const validate = require('../middleware/validation');
// const { taskSchema } = require('../validation/task');

// @route   GET /api/tasks
// @desc    Get user's tasks
router.get('/', auth, taskController.getUserTasks);

// @route   POST /api/tasks
// @desc    Create new task (teacher only)
router.post('/', auth, roleCheck('teacher'), /*validate(taskSchema),*/ taskController.createTask);

// @route   GET /api/tasks/assigned
// @desc    Get tasks assigned by teacher
router.get('/assigned', auth, roleCheck('teacher'), taskController.getAssignedTasks);

// @route   POST /api/tasks/:id/complete
// @desc    Mark task as completed
router.post('/:id/complete', auth, taskController.completeTask);

// @route   PUT /api/tasks/:id
// @desc    Update task (teacher only)
router.put('/:id', auth, roleCheck('teacher'), /*validate(taskSchema),*/ taskController.updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task (teacher only)
router.delete('/:id', auth, roleCheck('teacher'), taskController.deleteTask);

module.exports = router; 