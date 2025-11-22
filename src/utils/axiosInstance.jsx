import axios from "axios";

// ✅ Create axios instance
const axiosInstance = axios.create({
  baseURL:
    // "http://localhost:4000/api",
    import.meta.env.VITE_API_BASE_URL,
});

// ✅ Add token before each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 / 403 responses
let isAlertShown = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !isAlertShown) {
      isAlertShown = true;
      alert("Session expired or unauthorized. Please log in again.");

      // 🔹 Clear token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🔹 Redirect to login
      window.location.href = "/login";

      // Avoid showing multiple alerts
      setTimeout(() => {
        isAlertShown = false;
      }, 2000);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
