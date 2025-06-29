import { useState, useEffect } from "react";
import { storage } from "../utils/helpers";

// Custom hook for localStorage with automatic state synchronization
export const useLocalStorage = (key, defaultValue = null) => {
  // Initialize state with value from localStorage or default
  const [value, setValue] = useState(() => {
    return storage.get(key, defaultValue);
  });

  // Update localStorage when value changes
  const setStoredValue = (newValue) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;

      // Update state
      setValue(valueToStore);

      // Update localStorage
      if (valueToStore === null || valueToStore === undefined) {
        storage.remove(key);
      } else {
        storage.set(key, valueToStore);
      }

      return true;
    } catch (error) {
      console.error(`Error updating localStorage key "${key}":`, error);
      return false;
    }
  };

  // Remove value from localStorage and state
  const removeValue = () => {
    try {
      setValue(defaultValue);
      storage.remove(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  };

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== JSON.stringify(value)) {
        const newValue = e.newValue ? JSON.parse(e.newValue) : defaultValue;
        setValue(newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, value, defaultValue]);

  return [value, setStoredValue, removeValue];
};

// Hook for managing multiple localStorage keys as an object
export const useLocalStorageState = (keys) => {
  const [state, setState] = useState(() => {
    const initialState = {};
    Object.entries(keys).forEach(([key, defaultValue]) => {
      initialState[key] = storage.get(key, defaultValue);
    });
    return initialState;
  });

  const updateState = (updates) => {
    setState((prevState) => {
      const newState = { ...prevState, ...updates };

      // Update localStorage for changed keys
      Object.entries(updates).forEach(([key, value]) => {
        if (keys[key] !== undefined) {
          storage.set(key, value);
        }
      });

      return newState;
    });
  };

  const resetState = () => {
    const resetState = {};
    Object.entries(keys).forEach(([key, defaultValue]) => {
      resetState[key] = defaultValue;
      storage.remove(key);
    });
    setState(resetState);
  };

  return [state, updateState, resetState];
};

// Hook for caching API responses in localStorage
export const useLocalStorageCache = (key, fetchFn, options = {}) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    staleTime = 1 * 60 * 1000, // 1 minute default
    refetchOnMount = true,
  } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Check cache on mount
  useEffect(() => {
    const cachedData = storage.get(key);
    const cachedTimestamp = storage.get(`${key}_timestamp`);

    if (cachedData && cachedTimestamp) {
      const age = Date.now() - cachedTimestamp;

      if (age < cacheTime) {
        setData(cachedData);
        setLastFetched(cachedTimestamp);

        // If data is stale but not expired, show cached data and refetch
        if (age > staleTime && refetchOnMount) {
          fetchData();
        }
        return;
      }
    }

    // No valid cache, fetch fresh data
    if (refetchOnMount) {
      fetchData();
    }
  }, [key]);

  const fetchData = async () => {
    if (!fetchFn) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchFn();
      const timestamp = Date.now();

      setData(result);
      setLastFetched(timestamp);

      // Cache the data
      storage.set(key, result);
      storage.set(`${key}_timestamp`, timestamp);
    } catch (err) {
      setError(err);
      console.error(`Cache fetch error for key "${key}":`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const invalidateCache = () => {
    storage.remove(key);
    storage.remove(`${key}_timestamp`);
    setData(null);
    setLastFetched(null);
  };

  const refetch = () => {
    fetchData();
  };

  const isStale = lastFetched && Date.now() - lastFetched > staleTime;
  const isExpired = lastFetched && Date.now() - lastFetched > cacheTime;

  return {
    data,
    isLoading,
    error,
    lastFetched,
    isStale,
    isExpired,
    refetch,
    invalidateCache,
  };
};

// Hook for storing user preferences
export const useUserPreferences = () => {
  const defaultPreferences = {
    theme: "light",
    fontSize: "medium",
    language: "en",
    notifications: true,
    soundEnabled: true,
    autoPlay: false,
    highContrast: false,
    reducedMotion: false,
  };

  const [preferences, setPreferences] = useLocalStorage(
    "userPreferences",
    defaultPreferences,
  );

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const getPreference = (key) => {
    return preferences?.[key] ?? defaultPreferences[key];
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    getPreference,
  };
};

export default useLocalStorage;
