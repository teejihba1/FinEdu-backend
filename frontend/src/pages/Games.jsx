import React from "react";
import { motion } from "framer-motion";

const Games = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Games</h1>
      </div>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🎮</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Games Coming Soon
        </h2>
        <p className="text-gray-600 mb-4">
          Fun and educational financial games will be available here. Practice
          budgeting, credit decisions, and investment strategies through
          interactive gameplay.
        </p>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-purple-800 text-sm">
            This page will include budget quizzes, credit simulations, stock
            market games, and savings challenges.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Games;
