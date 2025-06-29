import React from "react";
import { motion } from "framer-motion";

const Chat = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">AI Financial Tutor</h1>
      </div>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🤖</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          AI Chat Coming Soon
        </h2>
        <p className="text-gray-600 mb-4">
          Chat with our AI financial tutor to get personalized advice, ask
          questions about financial concepts, and receive guidance in your
          preferred language.
        </p>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            This page will include real-time chat, voice input/output, quick
            questions, and contextual financial advice.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
