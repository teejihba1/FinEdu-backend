import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiWifi, HiOutlineWifi } from "react-icons/hi2";
import { useOffline } from "../../hooks/useOffline";
import { useLanguage } from "../../context/LanguageContext";

const OfflineIndicator = () => {
  const { isOnline, offlineActions, syncOfflineActions } = useOffline();
  const { t } = useLanguage();
  const [showIndicator, setShowIndicator] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState("good");

  // Show indicator when offline or has pending actions
  useEffect(() => {
    setShowIndicator(!isOnline || offlineActions.length > 0);
  }, [isOnline, offlineActions.length]);

  // Monitor connection quality
  useEffect(() => {
    const updateConnectionQuality = () => {
      if (!navigator.connection) return;

      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;

      switch (effectiveType) {
        case "slow-2g":
        case "2g":
          setConnectionQuality("poor");
          break;
        case "3g":
          setConnectionQuality("fair");
          break;
        case "4g":
          setConnectionQuality("good");
          break;
        default:
          setConnectionQuality("good");
      }
    };

    if (navigator.connection) {
      updateConnectionQuality();
      navigator.connection.addEventListener("change", updateConnectionQuality);

      return () => {
        navigator.connection.removeEventListener(
          "change",
          updateConnectionQuality,
        );
      };
    }
  }, []);

  const getIndicatorColor = () => {
    if (!isOnline) return "bg-red-500";
    if (offlineActions.length > 0) return "bg-orange-500";
    if (connectionQuality === "poor") return "bg-yellow-500";
    return "bg-green-500";
  };

  const getIndicatorText = () => {
    if (!isOnline) return t("common.offline");
    if (offlineActions.length > 0)
      return `${offlineActions.length} pending changes`;
    if (connectionQuality === "poor") return "Slow connection";
    return t("common.online");
  };

  const getIndicatorIcon = () => {
    if (!isOnline) return <HiOutlineWifi className="w-4 h-4" />;
    return <HiWifi className="w-4 h-4" />;
  };

  const handleSync = () => {
    if (isOnline && offlineActions.length > 0) {
      syncOfflineActions();
    }
  };

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 safe-area-top"
        >
          <div
            className={`${getIndicatorColor()} text-white px-4 py-2 text-sm`}
          >
            <div className="flex items-center justify-between max-w-screen-xl mx-auto">
              <div className="flex items-center space-x-2">
                {getIndicatorIcon()}
                <span className="font-medium">{getIndicatorText()}</span>
              </div>

              {/* Action button */}
              {isOnline && offlineActions.length > 0 && (
                <button
                  onClick={handleSync}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                  Sync Now
                </button>
              )}

              {/* Connection quality indicator */}
              {isOnline && (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-0.5">
                    <div
                      className={`w-1 h-3 rounded-full ${
                        connectionQuality !== "poor"
                          ? "bg-white"
                          : "bg-white bg-opacity-40"
                      }`}
                    />
                    <div
                      className={`w-1 h-4 rounded-full ${
                        connectionQuality === "good"
                          ? "bg-white"
                          : "bg-white bg-opacity-40"
                      }`}
                    />
                    <div
                      className={`w-1 h-5 rounded-full ${
                        connectionQuality === "good"
                          ? "bg-white"
                          : "bg-white bg-opacity-40"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Connection status component for detailed view
export const ConnectionStatus = ({ className = "" }) => {
  const { isOnline, getConnectionQuality, hasLimitedData } = useOffline();
  const connectionQuality = getConnectionQuality();

  const getStatusColor = () => {
    if (!isOnline) return "text-red-600";
    if (connectionQuality === "poor") return "text-yellow-600";
    if (connectionQuality === "fair") return "text-orange-600";
    return "text-green-600";
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (connectionQuality === "poor") return "Poor connection";
    if (connectionQuality === "fair") return "Fair connection";
    return "Good connection";
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
      />
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {hasLimitedData() && (
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          Data Saver
        </span>
      )}
    </div>
  );
};

// Offline banner for pages
export const OfflineBanner = ({ showDetails = false }) => {
  const { isOnline, offlineActions } = useOffline();

  if (isOnline && offlineActions.length === 0) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
      <div className="flex items-start">
        <HiOutlineWifi className="w-6 h-6 text-orange-400 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-800">
            {!isOnline ? "You are offline" : "Pending changes"}
          </h3>
          <p className="text-sm text-orange-700 mt-1">
            {!isOnline
              ? "Some features may be limited. Your progress will sync when you reconnect."
              : `You have ${offlineActions.length} changes waiting to sync.`}
          </p>
          {showDetails && offlineActions.length > 0 && (
            <div className="mt-2">
              <details className="text-xs text-orange-600">
                <summary className="cursor-pointer">
                  View pending changes
                </summary>
                <ul className="mt-1 ml-4 list-disc">
                  {offlineActions.slice(0, 5).map((action, index) => (
                    <li key={index}>
                      {action.type} -{" "}
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </li>
                  ))}
                  {offlineActions.length > 5 && (
                    <li>...and {offlineActions.length - 5} more</li>
                  )}
                </ul>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
