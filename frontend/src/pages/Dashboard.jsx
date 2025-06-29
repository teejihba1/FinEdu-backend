import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiAcademicCap,
  HiClipboardDocumentList,
  HiPuzzlePiece,
  HiChatBubbleLeftRight,
  HiArrowRight,
  HiTrophy,
  HiFire,
  HiHeart,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useGame } from "../context/GameContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { avatar, stats, isLoading } = useGame();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const quickActions = [
    {
      title: "Continue Learning",
      description: "Resume your last lesson",
      icon: HiAcademicCap,
      href: "/app/lessons",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "View Tasks",
      description: "Check your daily goals",
      icon: HiClipboardDocumentList,
      href: "/app/tasks",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Play Games",
      description: "Practice with fun activities",
      icon: HiPuzzlePiece,
      href: "/app/games",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Ask AI Tutor",
      description: "Get instant help",
      icon: HiChatBubbleLeftRight,
      href: "/app/chat",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {avatar && (
              <div className="absolute -bottom-1 -right-1 level-badge">
                {avatar.level}
              </div>
            )}
          </div>

          {/* Welcome Text */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {t("dashboard.welcomeBack", {
                name: user?.name?.split(" ")[0] || "there",
              })}
            </h1>
            <p className="text-gray-600 mb-3">
              Ready to continue your financial learning journey?
            </p>

            {/* XP Progress */}
            {avatar && (
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Level {avatar.level}</span>
                    <span>{avatar.xp} XP</span>
                  </div>
                  <div className="xp-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${avatar.xp % 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {avatar && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="card p-4 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <HiTrophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {avatar.level}
            </div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>

          <div className="card p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <HiHeart className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {avatar.health}%
            </div>
            <div className="text-sm text-gray-600">Health</div>
          </div>

          <div className="card p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <HiFire className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {avatar.streak}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>

          <div className="card p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 text-xl">⚡</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{avatar.xp}</div>
            <div className="text-sm text-gray-600">Total XP</div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("dashboard.quickActions")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href} className="card-hover p-6 group">
              <div
                className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <action.icon className={`w-6 h-6 ${action.textColor}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{action.description}</p>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                <span>Get started</span>
                <HiArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Progress Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Learning Progress */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("dashboard.yourProgress")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HiAcademicCap className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Lessons Completed</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.lessonsCompleted}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HiClipboardDocumentList className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Tasks Completed</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.tasksCompleted}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HiPuzzlePiece className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Games Played</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.gamesPlayed}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Completed "Budget Basics"
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  +50 XP
                </span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">🎮</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Played Budget Challenge
                  </p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
                <span className="text-blue-600 text-sm font-medium">
                  +30 XP
                </span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xs">🏆</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Unlocked "First Steps" badge
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
                <span className="text-purple-600 text-sm font-medium">
                  +100 XP
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
