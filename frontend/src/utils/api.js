import axios from "axios";
import { toast } from "react-hot-toast";

// Create axios instance
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle network errors
    if (!response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    // Handle auth errors
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle other errors
    const message =
      response.data?.error || response.data?.message || "An error occurred";

    // Don't show toast for certain endpoints
    const silentEndpoints = ["/auth/profile"];
    if (
      !silentEndpoints.some((endpoint) => error.config.url.includes(endpoint))
    ) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  uploadAvatar: (formData) =>
    api.post("/auth/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// User API
export const userAPI = {
  getUsers: (params) => api.get("/users", { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStudents: (params) => api.get("/users/students", { params }),
  getTeachers: (params) => api.get("/users/teachers", { params }),
};

// Lesson API
export const lessonAPI = {
  getLessons: (params) => api.get("/lessons", { params }),
  getLessonById: (id) => api.get(`/lessons/${id}`),
  createLesson: (lessonData) => api.post("/lessons", lessonData),
  updateLesson: (id, lessonData) => api.put(`/lessons/${id}`, lessonData),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  completeLesson: (id, completionData) =>
    api.post(`/lessons/${id}/complete`, completionData),
  getFeaturedLessons: () => api.get("/lessons?featured=true&limit=6"),
  getUserProgress: () => api.get("/lessons/progress"),
};

// Task API
export const taskAPI = {
  getTasks: (params) => api.get("/tasks", { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post("/tasks", taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  completeTask: (id, completionData) =>
    api.post(`/tasks/${id}/complete`, completionData),
  getTodayTasks: () => api.get("/tasks?status=pending&limit=10"),
  getOverdueTasks: () => api.get("/tasks?status=overdue"),
};

// Game API
export const gameAPI = {
  getGames: () => api.get("/games"),
  getGameById: (id) => api.get(`/games/${id}`),
  startGame: (gameType, options) =>
    api.post("/games/start", { gameType, options }),
  submitGameResult: (sessionId, result) =>
    api.post(`/games/${sessionId}/complete`, result),
  getHighScores: (gameType) => api.get(`/games/${gameType}/scores`),
  getUserGameStats: () => api.get("/games/stats"),
};

// Avatar API
export const avatarAPI = {
  getAvatar: () => api.get("/avatar"),
  updateAvatar: (avatarData) => api.put("/avatar", avatarData),
  getInventory: () => api.get("/avatar/inventory"),
  purchaseItem: (itemId) => api.post("/avatar/purchase", { itemId }),
  equipItem: (itemId, slot) => api.post("/avatar/equip", { itemId, slot }),
};

// Chat API
export const chatAPI = {
  getChatHistory: (params) => api.get("/chatbot/history", { params }),
  sendMessage: (message, context) =>
    api.post("/chatbot/message", { message, context }),
  clearHistory: () => api.delete("/chatbot/history"),
  getQuickQuestions: () => api.get("/chatbot/quick-questions"),
};

// Analytics API
export const analyticsAPI = {
  getUserAnalytics: (period) =>
    api.get("/analytics/user", { params: { period } }),
  getProgressReport: (studentId, period) =>
    api.get(`/analytics/progress/${studentId}`, { params: { period } }),
  getClassOverview: () => api.get("/analytics/class"),
  exportReport: (type, params) =>
    api.get(`/analytics/export/${type}`, {
      params,
      responseType: "blob",
    }),
};

export default api;
