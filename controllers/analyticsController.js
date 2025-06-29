/**
 * Analytics Controller
 * Handles student/class progress and reporting
 */

const User = require('../models/User');
const Avatar = require('../models/Avatar');
const Lesson = require('../models/Lesson');
const Task = require('../models/Task');
const GameSession = require('../models/GameSession');
const { ERROR_MESSAGES, USER_ROLES } = require('../utils/constants');

module.exports = {
  /**
   * @route GET /api/analytics/student/:id
   * @desc Get student progress
   */
  getStudentProgress: async (req, res) => {
    try {
      const { id } = req.params;
      const student = await User.findById(id);
      
      if (!student) {
        return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      // Check if user can access this student's data
      if (req.user.role === USER_ROLES.STUDENT && req.user._id.toString() !== id) {
        return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
      }

      // Get avatar stats
      const avatar = await Avatar.findOne({ userId: id });
      
      // Get lesson completion stats
      const lessonStats = await Lesson.aggregate([
        {
          $lookup: {
            from: 'lessons',
            localField: '_id',
            foreignField: 'completionCount',
            as: 'completedLessons'
          }
        },
        {
          $group: {
            _id: null,
            totalLessons: { $sum: 1 },
            completedLessons: { $sum: '$completionCount' },
            averageScore: { $avg: '$averageScore' }
          }
        }
      ]);

      // Get task completion stats
      const taskStats = await Task.aggregate([
        {
          $match: { assignedTo: student._id }
        },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: { $sum: { $size: '$completions' } },
            overdueTasks: {
              $sum: {
                $cond: [
                  { $and: [{ $lt: ['$dueDate', new Date()] }, { $not: { $in: [student._id, '$completions.student'] } }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get game stats
      const gameStats = await GameSession.aggregate([
        {
          $match: { userId: student._id, isCompleted: true }
        },
        {
          $group: {
            _id: '$gameType',
            totalGames: { $sum: 1 },
            averageScore: { $avg: '$score' },
            bestScore: { $max: '$score' },
            totalXP: { $sum: '$xpEarned' }
          }
        }
      ]);

      // Get recent activity
      const recentActivity = await Promise.all([
        Lesson.find({ 'completionCount': { $gt: 0 } }).sort({ updatedAt: -1 }).limit(5),
        Task.find({ 'completions.student': student._id }).sort({ 'completions.completedAt': -1 }).limit(5),
        GameSession.find({ userId: student._id, isCompleted: true }).sort({ completedAt: -1 }).limit(5)
      ]);

      const progress = {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
          joinedAt: student.createdAt
        },
        avatar: avatar ? avatar.getStats() : null,
        lessonStats: lessonStats[0] || {
          totalLessons: 0,
          completedLessons: 0,
          averageScore: 0
        },
        taskStats: taskStats[0] || {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0
        },
        gameStats,
        recentActivity: {
          lessons: recentActivity[0],
          tasks: recentActivity[1],
          games: recentActivity[2]
        }
      };

      res.status(200).json(progress);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get student progress', message: err.message });
    }
  },

  /**
   * @route GET /api/analytics/class-overview
   * @desc Get class progress (teachers)
   */
  getClassOverview: async (req, res) => {
    try {
      const { classId, timeframe } = req.query;
      const startDate = timeframe === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) :
                       timeframe === 'month' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) :
                       new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default 90 days

      // Get all students (if teacher) or specific class
      let students;
      if (req.user.role === USER_ROLES.ADMIN) {
        students = await User.find({ role: USER_ROLES.STUDENT, isActive: true });
      } else {
        // For teachers, get their assigned students (implement class assignment logic)
        students = await User.find({ role: USER_ROLES.STUDENT, isActive: true });
      }

      const studentIds = students.map(s => s._id);

      // Get overall statistics
      const overallStats = await Avatar.aggregate([
        {
          $match: { userId: { $in: studentIds } }
        },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            averageLevel: { $avg: '$level' },
            averageXP: { $avg: '$xp' },
            totalLessonsCompleted: { $sum: '$totalLessonsCompleted' },
            totalTasksCompleted: { $sum: '$totalTasksCompleted' },
            totalGamesPlayed: { $sum: '$totalGamesPlayed' }
          }
        }
      ]);

      // Get lesson completion trends
      const lessonTrends = await Lesson.aggregate([
        {
          $match: { updatedAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" }
            },
            completions: { $sum: '$completionCount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Get top performers
      const topPerformers = await Avatar.find({ userId: { $in: studentIds } })
        .populate('userId', 'name email')
        .sort({ xp: -1 })
        .limit(10);

      // Get recent activity
      const recentActivity = await Promise.all([
        Lesson.find({ updatedAt: { $gte: startDate } }).sort({ updatedAt: -1 }).limit(10),
        Task.find({ createdAt: { $gte: startDate } }).sort({ createdAt: -1 }).limit(10),
        GameSession.find({ userId: { $in: studentIds }, completedAt: { $gte: startDate } })
          .populate('userId', 'name email')
          .sort({ completedAt: -1 })
          .limit(10)
      ]);

      const overview = {
        timeframe,
        totalStudents: students.length,
        overallStats: overallStats[0] || {
          totalStudents: 0,
          averageLevel: 0,
          averageXP: 0,
          totalLessonsCompleted: 0,
          totalTasksCompleted: 0,
          totalGamesPlayed: 0
        },
        lessonTrends,
        topPerformers,
        recentActivity: {
          lessons: recentActivity[0],
          tasks: recentActivity[1],
          games: recentActivity[2]
        }
      };

      res.status(200).json(overview);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get class overview', message: err.message });
    }
  },

  /**
   * @route GET /api/analytics/export-report
   * @desc Export progress report
   */
  exportReport: async (req, res) => {
    try {
      const { studentId, format, startDate, endDate } = req.query;
      
      if (studentId) {
        // Individual student report
        const student = await User.findById(studentId);
        if (!student) {
          return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        // Check permissions
        if (req.user.role === USER_ROLES.STUDENT && req.user._id.toString() !== studentId) {
          return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        // Generate individual report
        const avatar = await Avatar.findOne({ userId: studentId });
        const lessons = await Lesson.find({ isPublished: true });
        const tasks = await Task.find({ assignedTo: studentId });
        const games = await GameSession.find({ userId: studentId, isCompleted: true });

        const report = {
          student: {
            name: student.name,
            email: student.email,
            joinedAt: student.createdAt
          },
          avatar: avatar ? avatar.getStats() : null,
          lessons: {
            total: lessons.length,
            completed: avatar ? avatar.totalLessonsCompleted : 0,
            progress: avatar ? (avatar.totalLessonsCompleted / lessons.length * 100).toFixed(2) : 0
          },
          tasks: {
            total: tasks.length,
            completed: tasks.filter(t => t.isCompletedByStudent(studentId)).length,
            overdue: tasks.filter(t => !t.isCompletedByStudent(studentId) && t.isOverdue).length
          },
          games: {
            total: games.length,
            averageScore: games.length > 0 ? games.reduce((sum, g) => sum + g.score, 0) / games.length : 0,
            totalXP: games.reduce((sum, g) => sum + g.xpEarned, 0)
          },
          generatedAt: new Date()
        };

        res.status(200).json({
          message: 'Report generated successfully',
          report,
          format: format || 'json'
        });
      } else {
        // Class/overall report
        const students = await User.find({ role: USER_ROLES.STUDENT, isActive: true });
        const avatars = await Avatar.find({ userId: { $in: students.map(s => s._id) } });
        
        const classReport = {
          totalStudents: students.length,
          activeStudents: avatars.filter(a => a.lastActivityDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
          averageLevel: avatars.length > 0 ? avatars.reduce((sum, a) => sum + a.level, 0) / avatars.length : 0,
          averageXP: avatars.length > 0 ? avatars.reduce((sum, a) => sum + a.xp, 0) / avatars.length : 0,
          totalLessonsCompleted: avatars.reduce((sum, a) => sum + a.totalLessonsCompleted, 0),
          totalTasksCompleted: avatars.reduce((sum, a) => sum + a.totalTasksCompleted, 0),
          totalGamesPlayed: avatars.reduce((sum, a) => sum + a.totalGamesPlayed, 0),
          generatedAt: new Date()
        };

        res.status(200).json({
          message: 'Class report generated successfully',
          report: classReport,
          format: format || 'json'
        });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to export report', message: err.message });
    }
  }
}; 