import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Navigation from "./Navigation";
import { useAuth } from "../../context/AuthContext";
import { isMobile } from "../../utils/helpers";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationVisible, setNavigationVisible] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const mobile = isMobile();

  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    if (mobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, mobile]);

  // Handle scroll to hide/show navigation on mobile
  React.useEffect(() => {
    if (!mobile) return;

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setNavigationVisible(false);
      } else {
        // Scrolling up
        setNavigationVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobile]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 pt-16">
        {" "}
        {/* pt-16 for fixed header */}
        {/* Sidebar Navigation - Desktop */}
        {!mobile && (
          <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 z-30">
            <Navigation />
          </aside>
        )}
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobile && sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
              />

              {/* Sidebar */}
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed left-0 top-16 bottom-0 w-80 bg-white z-50 shadow-xl"
              >
                <Navigation onItemClick={() => setSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        {/* Main Content */}
        <main
          className={`flex-1 ${!mobile ? "ml-64" : ""} ${mobile ? "pb-20" : "pb-6"}`}
        >
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {mobile && (
        <AnimatePresence>
          {navigationVisible && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom"
            >
              <Navigation mobile />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Layout;
