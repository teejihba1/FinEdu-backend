import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiHome,
  HiAcademicCap,
  HiClipboardDocumentList,
  HiPuzzlePiece,
  HiUser,
  HiChatBubbleLeftRight,
  HiChartBarSquare,
  HiTrophy,
  HiBookOpen,
  HiCheckCircle,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useGame } from "../../context/GameContext";

const Navigation = ({ mobile = false, onItemClick }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { avatar, stats } = useGame();
  const location = useLocation();

  const navigationItems = [
    {
      name: t("nav.dashboard"),
      href: "/app/dashboard",
      icon: HiHome,
      badge: null,
    },
    {
      name: t("nav.lessons"),
      href: "/app/lessons",
      icon: HiAcademicCap,
      badge: avatar?.unreadLessons || null,
    },
    {
      name: t("nav.tasks"),
      href: "/app/tasks",
      icon: HiClipboardDocumentList,
      badge: avatar?.pendingTasks || null,
    },
    {
      name: t("nav.games"),
      href: "/app/games",
      icon: HiPuzzlePiece,
      badge: null,
    },
    {
      name: t("nav.chat"),
      href: "/app/chat",
      icon: HiChatBubbleLeftRight,
      badge: null,
    },
    {
      name: t("nav.profile"),
      href: "/app/profile",
      icon: HiUser,
      badge: null,
    },
  ];

  // Add analytics for teachers
  if (user?.role === "teacher" || user?.role === "admin") {
    navigationItems.push({
      name: t("nav.analytics"),
      href: "/app/analytics",
      icon: HiChartBarSquare,
      badge: null,
    });
  }

  const NavItem = ({ item, mobile = false }) => {
    const isActive =
      location.pathname === item.href ||
      (item.href !== "/app/dashboard" &&
        location.pathname.startsWith(item.href));

    const baseClasses = mobile
      ? "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-h-[60px] text-xs font-medium"
      : "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium";

    const activeClasses = mobile
      ? "text-primary-600 bg-primary-50"
      : "text-primary-700 bg-primary-50 border border-primary-200";

    const inactiveClasses = mobile
      ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50";

    return (
      <NavLink
        to={item.href}
        onClick={onItemClick}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} touch-target`}
      >
        <div className="relative">
          <item.icon className={mobile ? "w-5 h-5" : "w-5 h-5"} />
          {item.badge && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {item.badge > 99 ? "99+" : item.badge}
            </motion.div>
          )}
        </div>
        <span className={mobile ? "mt-1" : ""}>{item.name}</span>
      </NavLink>
    );
  };

  if (mobile) {
    return (
      <nav className="grid grid-cols-5 gap-1 px-2 py-2">
        {navigationItems.slice(0, 5).map((item) => (
          <NavItem key={item.href} item={item} mobile />
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col h-full">
      {/* User progress section */}
      {avatar && (
        <div className="p-4 border-b border-gray-100">
          <div className="text-center">
            <div className="level-badge mx-auto mb-2">{avatar.level}</div>
            <p className="text-xs text-gray-600 mb-2">Level {avatar.level}</p>

            {/* XP Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>XP</span>
                <span>{avatar.xp}</span>
              </div>
              <div className="xp-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${avatar.xp % 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Health */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Health</span>
                <span>{avatar.health}%</span>
              </div>
              <div className="health-bar">
                <motion.div
                  className={`h-full transition-all duration-500 ${
                    avatar.health >= 80
                      ? "bg-green-500"
                      : avatar.health >= 60
                        ? "bg-yellow-500"
                        : avatar.health >= 40
                          ? "bg-orange-500"
                          : "bg-red-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${avatar.health}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
              <span>🔥</span>
              <span>{avatar.streak} day streak</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation items */}
      <div className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>

      {/* Quick stats section */}
      {stats && (
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <HiBookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Lessons</span>
              </div>
              <span className="font-medium">{stats.lessonsCompleted}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <HiCheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Tasks</span>
              </div>
              <span className="font-medium">{stats.tasksCompleted}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <HiTrophy className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600">Games</span>
              </div>
              <span className="font-medium">{stats.gamesPlayed}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
