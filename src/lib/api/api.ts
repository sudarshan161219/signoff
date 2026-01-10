import axios from "axios";

// Create the Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

api.interceptors.request.use(
  (config) => {
    // 1. Try to get the token from browser storage
    const adminToken = localStorage.getItem("signoff_admin_token");

    // 2. If it exists, attach it to the headers
    if (adminToken) {
      // This key "x-admin-token" MUST match exactly what you typed in your Backend Middleware
      config.headers["x-admin-token"] = adminToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
