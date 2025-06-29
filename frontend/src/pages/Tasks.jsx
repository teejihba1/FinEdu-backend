import React from "react";
import { motion } from "framer-motion";

const Tasks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
      </div>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tasks Coming Soon
        </h2>
        <p className="text-gray-600 mb-4">
          Daily financial tasks and challenges will be available here. Complete
          tasks to earn health points and maintain your learning streak.
        </p>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            This page will include daily habits, learning goals, practical
            exercises, and habit tracking with gamification.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Tasks;
