// src/api/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_MIGHTYBULL_BASE_URL || '',
});

// Request interceptor to attach headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 🛡️ Required for ngrok to work with frontend (bypass warning)
        config.headers['ngrok-skip-browser-warning'] = 'true';

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for catching 401 globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            console.info("🔁 Redirecting to login:", error.response.message);
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
