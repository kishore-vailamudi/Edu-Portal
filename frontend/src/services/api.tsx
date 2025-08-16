import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance for the Node.js backend
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
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
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post("/users/register", userData),
  login: (credentials: any) => api.post("/users/login", credentials),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (userData: any) => api.patch("/users/profile", userData),
  updatePassword: (passwordData: any) =>
    api.patch("/users/password", passwordData),
};

// Subject API
export const subjectAPI = {
  getAllSubjects: () => api.get("/subjects"),
  getSubjectById: (id: string) => api.get(`/subjects/${id}`),
  createSubject: (subjectData: any) => api.post("/subjects", subjectData),
  updateSubject: (id: string, subjectData: any) =>
    api.patch(`/subjects/${id}`, subjectData),
  deleteSubject: (id: string) => api.delete(`/subjects/${id}`),
};

// Unit API
export const unitAPI = {
  getUnitsBySubject: (subjectId: string) =>
    api.get(`/units/subject/${subjectId}`),
  getUnitById: (id: string) => api.get(`/units/${id}`),
  createUnit: (unitData: any) => api.post("/units", unitData),
  updateUnit: (id: string, unitData: any) =>
    api.patch(`/units/${id}`, unitData),
  updateLessonStatus: (data: any) => api.patch("/units/lesson/status", data),
  deleteUnit: (id: string) => api.delete(`/units/${id}`),
  checkAllLessonsCompleted: (unitId: string) =>
    api.get(`/units/check-completion/${unitId}`),
};

// Quiz API
export const quizAPI = {
  getQuizById: async (id: string) => {
    try {
      console.log(`API call: Getting quiz with ID: ${id}`);
      const response = await api.get(`/quizzes/${id}`);
      return response;
    } catch (error: any) {
      console.error(`API error: Failed to get quiz with ID: ${id}`, error);

      // If the error suggests using a sample quiz, try to fetch that
      if (
        error.response?.status === 404 &&
        error.response?.data?.sampleQuizId
      ) {
        console.log(
          `Attempting to fetch sample quiz: ${error.response.data.sampleQuizId}`
        );
        try {
          // Only attempt this if we're not already trying to get the sample quiz
          if (id !== error.response.data.sampleQuizId) {
            return await api.get(
              `/quizzes/${error.response.data.sampleQuizId}`
            );
          }
        } catch (sampleError) {
          console.error("Failed to fetch sample quiz as fallback", sampleError);
        }
      }

      // Re-throw the original error if we couldn't get the sample quiz
      throw error;
    }
  },
  getAllQuizzes: () => api.get("/quizzes/all"),
  submitQuiz: (quizData: any) => api.post("/quizzes/submit", quizData),
  getQuizResults: () => api.get("/quizzes/results/user"),
  getQuizResultById: (quizId: string) => api.get(`/quizzes/results/${quizId}`),
  createQuiz: (quizData: any) => api.post("/quizzes", quizData),
  updateQuiz: (id: string, quizData: any) =>
    api.patch(`/quizzes/${id}`, quizData),
  deleteQuiz: (id: string) => api.delete(`/quizzes/${id}`),
};

// Review API
export const reviewAPI = {
  getReviewMaterials: () => api.get("/reviews/materials"),
  getRecommendationsBasedOnQuiz: (quizId: string) =>
    api.get(`/reviews/recommendations/${quizId}`),
  createReviewMaterial: (materialData: any) =>
    api.post("/reviews/materials", materialData),
  updateReviewMaterial: (id: string, materialData: any) =>
    api.patch(`/reviews/materials/${id}`, materialData),
};

// Progress API
export const progressAPI = {
  getUserProgress: () => api.get("/progress"),
  updateUnitProgress: (data: any) => api.patch("/progress/unit", data),
  updateQuizScore: (data: any) => api.patch("/progress/quiz", data),
  updateTimeSpent: (data: any) => api.patch("/progress/time", data),
};

// AI API endpoints
export const aiAPI = {
  generateResponse: (messages: any) => api.post("/ai/generate", { messages }),
};

// Upload API endpoints
export const uploadAPI = {
  uploadProfileImage: (imageData: string, filename: string) =>
    api.post("/uploads/profile-image", { imageData, filename }),
};

export default api;
