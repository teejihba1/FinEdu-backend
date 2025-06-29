import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { storage } from "../utils/helpers";
import { STORAGE_KEYS, OFFLINE_CONFIG } from "../utils/constants";

// Custom hook for offline detection and management
export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineActions, setOfflineActions] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(
    storage.get("lastSyncTime", Date.now()),
  );

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You are back online!", {
        icon: "🌐",
        duration: 3000,
      });
      syncOfflineActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Some features may be limited.", {
        icon: "📱",
        duration: 4000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load offline actions from storage
  useEffect(() => {
    const savedActions = storage.get(STORAGE_KEYS.OFFLINE_DATA, []);
    setOfflineActions(savedActions);
  }, []);

  // Save offline actions to storage
  useEffect(() => {
    storage.set(STORAGE_KEYS.OFFLINE_DATA, offlineActions);
  }, [offlineActions]);

  // Queue action for offline execution
  const queueOfflineAction = useCallback((action) => {
    const actionWithId = {
      ...action,
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    setOfflineActions((prev) => {
      const updated = [...prev, actionWithId];

      // Limit number of offline actions
      if (updated.length > OFFLINE_CONFIG.MAX_OFFLINE_ACTIONS) {
        return updated.slice(-OFFLINE_CONFIG.MAX_OFFLINE_ACTIONS);
      }

      return updated;
    });

    return actionWithId.id;
  }, []);

  // Remove action from queue
  const removeOfflineAction = useCallback((actionId) => {
    setOfflineActions((prev) =>
      prev.filter((action) => action.id !== actionId),
    );
  }, []);

  // Sync offline actions when back online
  const syncOfflineActions = useCallback(async () => {
    if (!isOnline || offlineActions.length === 0) return;

    toast.loading("Syncing offline changes...", { id: "sync" });

    const successfulActions = [];
    const failedActions = [];

    for (const action of offlineActions) {
      try {
        await executeAction(action);
        successfulActions.push(action.id);
      } catch (error) {
        console.error("Failed to sync action:", action, error);

        // Increment retry count
        const updatedAction = {
          ...action,
          retryCount: action.retryCount + 1,
          lastError: error.message,
        };

        // Remove if max retries reached
        if (updatedAction.retryCount >= OFFLINE_CONFIG.RETRY_ATTEMPTS) {
          failedActions.push(action.id);
        } else {
          // Keep for retry
          setOfflineActions((prev) =>
            prev.map((a) => (a.id === action.id ? updatedAction : a)),
          );
        }
      }
    }

    // Remove successful and permanently failed actions
    const actionsToRemove = [...successfulActions, ...failedActions];
    setOfflineActions((prev) =>
      prev.filter((action) => !actionsToRemove.includes(action.id)),
    );

    // Update sync time
    const syncTime = Date.now();
    setLastSyncTime(syncTime);
    storage.set("lastSyncTime", syncTime);

    toast.dismiss("sync");

    if (successfulActions.length > 0) {
      toast.success(`${successfulActions.length} changes synced successfully!`);
    }

    if (failedActions.length > 0) {
      toast.error(`${failedActions.length} changes failed to sync.`);
    }
  }, [isOnline, offlineActions]);

  // Execute a specific action
  const executeAction = async (action) => {
    const { type, endpoint, method, data, params } = action;

    switch (type) {
      case "API_CALL":
        const response = await fetch(endpoint, {
          method: method || "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storage.get(STORAGE_KEYS.TOKEN)}`,
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();

      case "LESSON_COMPLETION":
        // Handle lesson completion sync
        return await syncLessonCompletion(action.data);

      case "TASK_COMPLETION":
        // Handle task completion sync
        return await syncTaskCompletion(action.data);

      case "GAME_RESULT":
        // Handle game result sync
        return await syncGameResult(action.data);

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  };

  // Sync lesson completion
  const syncLessonCompletion = async (data) => {
    const response = await fetch(`/api/lessons/${data.lessonId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storage.get(STORAGE_KEYS.TOKEN)}`,
      },
      body: JSON.stringify(data.completionData),
    });

    if (!response.ok) {
      throw new Error("Failed to sync lesson completion");
    }

    return response.json();
  };

  // Sync task completion
  const syncTaskCompletion = async (data) => {
    const response = await fetch(`/api/tasks/${data.taskId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storage.get(STORAGE_KEYS.TOKEN)}`,
      },
      body: JSON.stringify(data.completionData),
    });

    if (!response.ok) {
      throw new Error("Failed to sync task completion");
    }

    return response.json();
  };

  // Sync game result
  const syncGameResult = async (data) => {
    const response = await fetch(`/api/games/${data.sessionId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storage.get(STORAGE_KEYS.TOKEN)}`,
      },
      body: JSON.stringify(data.result),
    });

    if (!response.ok) {
      throw new Error("Failed to sync game result");
    }

    return response.json();
  };

  // Get cached data for offline use
  const getCachedData = useCallback((key, defaultValue = null) => {
    return storage.get(`cache_${key}`, defaultValue);
  }, []);

  // Cache data for offline use
  const setCachedData = useCallback(
    (key, data, maxAge = OFFLINE_CONFIG.CACHE_DURATION) => {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        maxAge,
      };

      storage.set(`cache_${key}`, cacheEntry);
    },
    [],
  );

  // Check if cached data is still valid
  const isCacheValid = useCallback((key) => {
    const cacheEntry = storage.get(`cache_${key}`);

    if (!cacheEntry) return false;

    const age = Date.now() - cacheEntry.timestamp;
    return age < cacheEntry.maxAge;
  }, []);

  // Clear expired cache entries
  const clearExpiredCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith("cache_"));

    cacheKeys.forEach((key) => {
      if (!isCacheValid(key.replace("cache_", ""))) {
        storage.remove(key);
      }
    });
  }, [isCacheValid]);

  // Periodically clear expired cache
  useEffect(() => {
    const interval = setInterval(clearExpiredCache, 60000); // Every minute
    return () => clearInterval(interval);
  }, [clearExpiredCache]);

  // Get connection quality estimate
  const getConnectionQuality = useCallback(() => {
    if (!navigator.connection) return "unknown";

    const connection = navigator.connection;
    const effectiveType = connection.effectiveType;

    switch (effectiveType) {
      case "slow-2g":
      case "2g":
        return "poor";
      case "3g":
        return "fair";
      case "4g":
        return "good";
      default:
        return "unknown";
    }
  }, []);

  // Check if device has limited data
  const hasLimitedData = useCallback(() => {
    if (!navigator.connection) return false;
    return navigator.connection.saveData;
  }, []);

  return {
    isOnline,
    offlineActions,
    lastSyncTime,
    queueOfflineAction,
    removeOfflineAction,
    syncOfflineActions,
    getCachedData,
    setCachedData,
    isCacheValid,
    clearExpiredCache,
    getConnectionQuality,
    hasLimitedData,
  };
};

// Hook for managing offline-first data
export const useOfflineData = (key, fetchFn, options = {}) => {
  const {
    cacheFirst = true,
    syncOnMount = true,
    syncInterval = 300000, // 5 minutes
  } = options;

  const { isOnline, getCachedData, setCachedData, isCacheValid } = useOffline();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = getCachedData(key);

    if (cachedData && isCacheValid(key)) {
      setData(cachedData.data);
      setLastSynced(cachedData.timestamp);

      // If online and should sync, fetch fresh data
      if (isOnline && syncOnMount && !cacheFirst) {
        fetchData();
      }
    } else if (isOnline && syncOnMount) {
      fetchData();
    }
  }, [key]);

  // Fetch data from server
  const fetchData = async () => {
    if (!fetchFn) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchFn();

      setData(result);
      setCachedData(key, result);
      setLastSynced(Date.now());
    } catch (err) {
      setError(err);

      // If offline and have cached data, show cached data
      const cachedData = getCachedData(key);
      if (cachedData && !isOnline) {
        setData(cachedData.data);
        setLastSynced(cachedData.timestamp);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline || !syncInterval) return;

    const interval = setInterval(() => {
      fetchData();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [isOnline, syncInterval]);

  const refetch = () => {
    if (isOnline) {
      fetchData();
    }
  };

  return {
    data,
    isLoading,
    error,
    lastSynced,
    refetch,
    isStale: lastSynced && Date.now() - lastSynced > syncInterval,
  };
};

export default useOffline;
