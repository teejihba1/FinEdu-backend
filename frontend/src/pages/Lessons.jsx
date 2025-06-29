import React from "react";
import { motion } from "framer-motion";

const Lessons = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
      </div>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📚</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Lessons Coming Soon
        </h2>
        <p className="text-gray-600 mb-4">
          Interactive financial lessons will be available here. You'll be able
          to learn about budgeting, saving, investing, and more.
        </p>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            This page will include lesson categories, progress tracking,
            quizzes, and multimedia content optimized for rural users.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Lessons;
