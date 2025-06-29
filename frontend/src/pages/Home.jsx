import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiAcademicCap,
  HiPuzzlePiece,
  HiChatBubbleLeftRight,
  HiTrophy,
  HiShieldCheck,
  HiGlobeAlt,
  HiArrowRight,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const features = [
    {
      icon: HiAcademicCap,
      title: "Interactive Lessons",
      description:
        "Learn financial concepts through engaging, easy-to-understand lessons designed for rural communities.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: HiPuzzlePiece,
      title: "Educational Games",
      description:
        "Practice financial skills with fun games including budget planning, credit simulations, and investment basics.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: HiChatBubbleLeftRight,
      title: "AI Financial Tutor",
      description:
        "Get personalized financial advice and answers to your questions from our AI-powered chatbot.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: HiTrophy,
      title: "Gamified Learning",
      description:
        "Earn XP, level up your avatar, and unlock achievements as you progress through your financial education journey.",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: HiShieldCheck,
      title: "Offline Support",
      description:
        "Continue learning even without internet. Your progress syncs automatically when you reconnect.",
      color: "from-red-500 to-red-600",
    },
    {
      icon: HiGlobeAlt,
      title: "Multi-Language",
      description:
        "Learn in your preferred language with support for English, Hindi, and Kannada.",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Students Learning" },
    { number: "500+", label: "Lessons Available" },
    { number: "50+", label: "Interactive Games" },
    { number: "95%", label: "Success Rate" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                💰
              </div>
              <span className="text-2xl font-bold text-gray-900">FinEdu</span>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/app/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Master Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                  Financial Future
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Learn essential financial skills through interactive lessons,
                games, and personalized AI guidance. Designed specifically for
                rural communities with offline support and multi-language
                options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="btn btn-primary btn-lg flex items-center justify-center space-x-2"
                    >
                      <span>Start Learning Free</span>
                      <HiArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">
                      Login to Continue
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/app/dashboard"
                    className="btn btn-primary btn-lg flex items-center justify-center space-x-2"
                  >
                    <span>Continue Learning</span>
                    <HiArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Hero illustration placeholder */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    L5
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Ramesh Kumar
                    </h3>
                    <p className="text-gray-500 text-sm">Level 5 • 1,250 XP</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-800 font-medium">
                      Budget Planning
                    </span>
                    <span className="text-green-600">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-blue-800 font-medium">
                      Savings Strategies
                    </span>
                    <span className="text-blue-600">📚 In Progress</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">
                      Investment Basics
                    </span>
                    <span className="text-gray-500">🔒 Locked</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines traditional learning with
              modern technology to make financial education accessible and
              engaging.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of learners who have already started their journey
              to financial literacy.
            </p>
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg font-semibold"
              >
                Get Started for Free
              </Link>
            ) : (
              <Link
                to="/app/dashboard"
                className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg font-semibold"
              >
                Continue Your Journey
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  💰
                </div>
                <span className="text-xl font-bold">FinEdu</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering rural communities with accessible financial education
                through technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Interactive Lessons</li>
                <li>Educational Games</li>
                <li>AI Tutor</li>
                <li>Offline Support</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community</li>
                <li>Feedback</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FinEdu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
