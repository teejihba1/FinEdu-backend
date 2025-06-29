/**
 * Lesson Controller
 * Handles lesson CRUD and completion
 */

const Lesson = require('../models/Lesson');
const Avatar = require('../models/Avatar');
const { calculateXP, generatePagination } = require('../utils/helpers');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, LESSON_CATEGORIES, DIFFICULTY_LEVELS } = require('../utils/constants');

module.exports = {
  /**
   * @route GET /api/lessons
   * @desc Get all lessons (with filters)
   */
  getAllLessons: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category || '';
      const difficulty = req.query.difficulty || '';
      const language = req.query.language || '';
      const search = req.query.search || '';
      const featured = req.query.featured === 'true';

      let query = { isPublished: true };
      
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (language) query.language = language;
      if (featured) query.isFeatured = true;
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const total = await Lesson.countDocuments(query);
      const lessons = await Lesson.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const pagination = generatePagination(page, limit, total);

      res.status(200).json({
        lessons,
        pagination
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get lessons', message: err.message });
    }
  },

  /**
   * @route GET /api/lessons/:id
   * @desc Get lesson by ID
   */
  getLessonById: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('prerequisites', 'title description');

      if (!lesson) {
        return res.status(404).json({ error: ERROR_MESSAGES.LESSON_NOT_FOUND });
      }

      // Check if lesson is published or user is the creator
      if (!lesson.isPublished && lesson.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      }

      res.status(200).json({ lesson });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get lesson', message: err.message });
    }
  },

  /**
   * @route POST /api/lessons
   * @desc Create a new lesson (teachers only)
   */
  createLesson: async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        language,
        content,
        difficulty,
        xpReward,
        estimatedDuration,
        prerequisites,
        tags
      } = req.body;

      const lesson = await Lesson.create({
        title,
        description,
        category,
        language: language || 'en',
        content,
        difficulty: difficulty || DIFFICULTY_LEVELS.BEGINNER,
        xpReward: xpReward || 10,
        estimatedDuration: estimatedDuration || 15,
        prerequisites: prerequisites || [],
        tags: tags || [],
        createdBy: req.user._id,
        isPublished: false
      });

      const populatedLesson = await lesson.populate('createdBy', 'name email');

      res.status(201).json({
        message: SUCCESS_MESSAGES.LESSON_CREATED,
        lesson: populatedLesson
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create lesson', message: err.message });
    }
  },

  /**
   * @route PUT /api/lessons/:id
   * @desc Update lesson by ID (teachers only)
   */
  updateLesson: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        return res.status(404).json({ error: ERROR_MESSAGES.LESSON_NOT_FOUND });
      }

      // Check if user is the creator
      if (lesson.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      }

      const {
        title,
        description,
        category,
        language,
        content,
        difficulty,
        xpReward,
        estimatedDuration,
        prerequisites,
        tags,
        isPublished,
        isFeatured
      } = req.body;

      // Update fields
      if (title) lesson.title = title;
      if (description) lesson.description = description;
      if (category) lesson.category = category;
      if (language) lesson.language = language;
      if (content) lesson.content = content;
      if (difficulty) lesson.difficulty = difficulty;
      if (xpReward) lesson.xpReward = xpReward;
      if (estimatedDuration) lesson.estimatedDuration = estimatedDuration;
      if (prerequisites) lesson.prerequisites = prerequisites;
      if (tags) lesson.tags = tags;
      if (isPublished !== undefined) lesson.isPublished = isPublished;
      if (isFeatured !== undefined) lesson.isFeatured = isFeatured;

      await lesson.save();
      const updatedLesson = await lesson.populate('createdBy', 'name email');

      res.status(200).json({
        message: SUCCESS_MESSAGES.LESSON_UPDATED,
        lesson: updatedLesson
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update lesson', message: err.message });
    }
  },

  /**
   * @route DELETE /api/lessons/:id
   * @desc Delete lesson by ID (teachers only)
   */
  deleteLesson: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        return res.status(404).json({ error: ERROR_MESSAGES.LESSON_NOT_FOUND });
      }

      // Check if user is the creator
      if (lesson.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      }

      await lesson.remove();
      res.status(200).json({ message: SUCCESS_MESSAGES.LESSON_DELETED });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete lesson', message: err.message });
    }
  },

  /**
   * @route POST /api/lessons/:id/complete
   * @desc Mark lesson as completed
   */
  completeLesson: async (req, res) => {
    try {
      const { score, answers } = req.body;
      const lesson = await Lesson.findById(req.params.id);
      
      if (!lesson) {
        return res.status(404).json({ error: ERROR_MESSAGES.LESSON_NOT_FOUND });
      }

      if (!lesson.isPublished) {
        return res.status(400).json({ error: 'Lesson is not published' });
      }

      // Calculate XP based on score and difficulty
      const xpEarned = calculateXP('lesson', lesson.difficulty, lesson.xpReward);
      const finalScore = score || 0;

      // Update lesson completion count
      await lesson.incrementCompletion();

      // Update user's avatar with XP and stats
      const avatar = await Avatar.findOne({ userId: req.user._id });
      if (avatar) {
        await avatar.addXP(xpEarned);
        avatar.totalLessonsCompleted += 1;
        await avatar.save();

        // Check for achievements
        if (avatar.totalLessonsCompleted === 1) {
          await avatar.addAchievement('first_lesson');
        }
        if (finalScore === 100) {
          await avatar.addAchievement('perfect_score');
        }
      }

      res.status(200).json({
        message: 'Lesson completed successfully',
        xpEarned,
        score: finalScore,
        avatar: avatar ? avatar.getStats() : null
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to complete lesson', message: err.message });
    }
  }
}; 