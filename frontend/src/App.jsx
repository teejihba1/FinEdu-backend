import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "react-error-boundary";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { GameProvider } from "./context/GameContext";

// Components
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorFallback from "./components/common/ErrorFallback";
import OfflineIndicator from "./components/common/OfflineIndicator";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Lessons from "./pages/Lessons";
import Tasks from "./pages/Tasks";
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";

// Hooks
import { useOffline } from "./hooks/useOffline";

// Page animations
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3,
};

// Animated page wrapper
const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

// Main App component
function App() {
  const { isOnline, syncOfflineActions } = useOffline();

  // Register service worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });
    }
  }, []);

  // Sync offline actions when coming back online
  useEffect(() => {
    if (isOnline) {
      syncOfflineActions();
    }
  }, [isOnline, syncOfflineActions]);

  // Handle app installation prompt
  useEffect(() => {
    let deferredPrompt;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install button after 30 seconds if not already installed
      setTimeout(() => {
        if (
          deferredPrompt &&
          !window.matchMedia("(display-mode: standalone)").matches
        ) {
          // Could show a custom install prompt here
          console.log("App can be installed");
        }
      }, 30000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <LanguageProvider>
          <GameProvider>
            <div className="App min-h-screen bg-gray-50">
              {/* Offline indicator */}
              <OfflineIndicator />

              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* Public routes */}
                    <Route
                      path="/"
                      element={
                        <AnimatedPage>
                          <Home />
                        </AnimatedPage>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <AnimatedPage>
                          <Login />
                        </AnimatedPage>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <AnimatedPage>
                          <Register />
                        </AnimatedPage>
                      }
                    />

                    {/* Protected routes with layout */}
                    <Route
                      path="/app"
                      element={
                        <ProtectedRoute>
                          <Layout />
                        </ProtectedRoute>
                      }
                    >
                      <Route
                        index
                        element={<Navigate to="/app/dashboard" replace />}
                      />
                      <Route
                        path="dashboard"
                        element={
                          <AnimatedPage>
                            <Dashboard />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="lessons"
                        element={
                          <AnimatedPage>
                            <Lessons />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="lessons/:id"
                        element={
                          <AnimatedPage>
                            <Lessons />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="tasks"
                        element={
                          <AnimatedPage>
                            <Tasks />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="games"
                        element={
                          <AnimatedPage>
                            <Games />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="games/:gameType"
                        element={
                          <AnimatedPage>
                            <Games />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <AnimatedPage>
                            <Profile />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="chat"
                        element={
                          <AnimatedPage>
                            <Chat />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="analytics"
                        element={
                          <ProtectedRoute requiredRole="teacher">
                            <AnimatedPage>
                              <Analytics />
                            </AnimatedPage>
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </div>
          </GameProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
