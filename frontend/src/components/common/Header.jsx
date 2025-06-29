import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiBars3,
  HiXMark,
  HiBell,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiUser,
  HiGlobeAlt,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useGame } from "../../context/GameContext";
import {
  getImageUrl,
  generateAvatarGradient,
  isMobile,
} from "../../utils/helpers";

const Header = ({ onMenuClick, sidebarOpen }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, getAvailableLanguages } =
    useLanguage();
  const { avatar, getLevelProgress } = useGame();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const languageMenuRef = useRef(null);
  const mobile = isMobile();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target)
      ) {
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const levelProgress = getLevelProgress();
  const languages = getAvailableLanguages();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button and logo */}
        <div className="flex items-center space-x-3">
          {mobile && (
            <button
              onClick={onMenuClick}
              className="touch-target p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <HiXMark className="w-6 h-6" />
              ) : (
                <HiBars3 className="w-6 h-6" />
              )}
            </button>
          )}

          <Link
            to="/app/dashboard"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              💰
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              FinEdu
            </span>
          </Link>
        </div>

        {/* Center - Level and XP (desktop only) */}
        {!mobile && avatar && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="level-badge">{avatar.level}</div>
              <div className="flex flex-col">
                <div className="text-xs text-gray-500">
                  Level {avatar.level}
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-600">{avatar.xp} XP</span>
            </div>
          </div>
        )}

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-2">
          {/* Language selector */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="touch-target p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Change language"
            >
              <HiGlobeAlt className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {languageMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLanguageMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        currentLanguage === lang.code
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <div>
                        <div className="font-medium">{lang.nativeName}</div>
                        <div className="text-xs text-gray-500">{lang.name}</div>
                      </div>
                      {currentLanguage === lang.code && (
                        <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="touch-target p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <HiBell className="w-5 h-5" />
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </div>
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              {/* Avatar */}
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar, "small")}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${generateAvatarGradient(user?.name || "User")} flex items-center justify-center text-white text-sm font-medium`}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                {/* Health indicator */}
                {avatar && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white">
                    <div
                      className={`w-full h-full rounded-full ${
                        avatar.health >= 80
                          ? "bg-green-500"
                          : avatar.health >= 60
                            ? "bg-yellow-500"
                            : avatar.health >= 40
                              ? "bg-orange-500"
                              : "bg-red-500"
                      }`}
                    />
                  </div>
                )}
              </div>

              {!mobile && (
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </div>
                </div>
              )}
            </button>

            {/* User dropdown menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                    {avatar && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="level-badge text-xs">
                          {avatar.level}
                        </div>
                        <span className="text-xs text-gray-600">
                          {avatar.xp} XP
                        </span>
                        <span className="text-xs text-gray-600">
                          ❤️ {avatar.health}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  <Link
                    to="/app/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HiUser className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      // Navigate to settings when implemented
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HiCog6Tooth className="w-4 h-4" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <HiArrowRightOnRectangle className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
