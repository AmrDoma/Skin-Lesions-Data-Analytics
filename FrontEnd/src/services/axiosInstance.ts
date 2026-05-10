// services/axiosInstance.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Create an instance of Axios with global configurations
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL, // Your backend base URL
  withCredentials: true, // Ensures cookies are sent with each request
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig<unknown>) => {
    // Ensure headers exist
    config.headers = config.headers || {};

    // Dynamically set the Content-Type header based on the data type
    if (config.data instanceof FormData) {
      // For file uploads using FormData (e.g., with multer)
      config.headers["Content-Type"] = "multipart/form-data";
      config.headers["enctype"] = "multipart/form-data";
    } else {
      // Default to JSON for non-file requests
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
