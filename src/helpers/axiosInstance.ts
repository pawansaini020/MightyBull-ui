// src/api/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: '',
});

// Response interceptor for catching 401 globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            error.response.status === 401
        ) {
            localStorage.clear();
            console.info('redirecting to the home page' + error.response.message);
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
