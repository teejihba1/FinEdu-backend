import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../utils/api";
import { storage } from "../utils/helpers";
import { STORAGE_KEYS } from "../utils/constants";
import { toast } from "react-hot-toast";

// Auth context
const AuthContext = createContext();

// Auth states
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER",
  SET_LOADING: "SET_LOADING",
};

// Initial state
const initialState = {
  user: storage.get(STORAGE_KEYS.USER),
  token: storage.get(STORAGE_KEYS.TOKEN),
  isAuthenticated: !!storage.get(STORAGE_KEYS.TOKEN),
  isLoading: false,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (state.token && !state.user) {
        try {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          const response = await authAPI.getProfile();
          dispatch({
            type: AUTH_ACTIONS.UPDATE_USER,
            payload: response.data.user,
          });
          storage.set(STORAGE_KEYS.USER, response.data.user);
        } catch (error) {
          console.error("Failed to load user profile:", error);
          logout();
        } finally {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      }
    };

    loadUserProfile();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      // Store in localStorage
      storage.set(STORAGE_KEYS.TOKEN, token);
      storage.set(STORAGE_KEYS.USER, user);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authAPI.register(userData);
      const { user, token } = response.data;

      // Store in localStorage
      storage.set(STORAGE_KEYS.TOKEN, token);
      storage.set(STORAGE_KEYS.USER, user);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.USER);

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success("Logged out successfully");
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;

      storage.set(STORAGE_KEYS.USER, updatedUser);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser,
      });

      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to update profile";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await authAPI.uploadAvatar(formData);

      // Update user with new avatar
      const updatedUser = { ...state.user, avatar: response.data.avatar };
      storage.set(STORAGE_KEYS.USER, updatedUser);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { avatar: response.data.avatar },
      });

      toast.success("Avatar updated successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to upload avatar";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user can access resource
  const canAccess = (resource, action = "read") => {
    if (!state.isAuthenticated) return false;

    const { role } = state.user;

    // Admin can access everything
    if (role === "admin") return true;

    // Teacher permissions
    if (role === "teacher") {
      const teacherPermissions = {
        students: ["read", "create", "update"],
        lessons: ["read", "create", "update"],
        tasks: ["read", "create", "update"],
        analytics: ["read"],
      };
      return teacherPermissions[resource]?.includes(action);
    }

    // Student permissions
    if (role === "student") {
      const studentPermissions = {
        lessons: ["read"],
        tasks: ["read", "update"],
        games: ["read", "create"],
        avatar: ["read", "update"],
        profile: ["read", "update"],
      };
      return studentPermissions[resource]?.includes(action);
    }

    return false;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    uploadAvatar,
    hasRole,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
