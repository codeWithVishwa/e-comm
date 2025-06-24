import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
Axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accesstoken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // Remove toast.dismiss() here - let the error handler manage the toast
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken(refreshToken);
          if (newAccessToken) {
            localStorage.setItem("accesstoken", newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return Axios(originalRequest);
          }
        } catch (refreshError) {
          handleTokenRefreshFailure();
          return Promise.reject(refreshError);
        }
      } else {
        handleTokenRefreshFailure();
      }
    }

    // Handle other errors with proper toast management
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || getDefaultErrorMessage(status);
      
      // Use setTimeout to prevent race conditions
      setTimeout(() => {
        toast.dismiss()
        toast.error(errorMessage, {
          toastId: `error-${Date.now()}` // Unique ID for each toast
        });
      }, 0);
    } else {
      setTimeout(() => {
        toast.dismiss()
        toast.error("Network error - Please try again", {
          toastId: `network-error-${Date.now()}`
        });
      }, 0);
    }

    return Promise.reject(error);
  }
);

// REFRESH TOKEN FUNCTION (unchanged)
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await Axios({
      ...SummaryApi.refreshToken,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.data?.success) {
      throw new Error("Token refresh failed");
    }
    return response.data?.data?.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};

// HELPER FUNCTIONS (unchanged)
const handleTokenRefreshFailure = () => {
  localStorage.removeItem("accesstoken");
  localStorage.removeItem("refreshToken");
  sessionStorage.clear();
};

const getDefaultErrorMessage = (status) => {
  const messages = {
    400: "Invalid request",
    403: "Access denied",
    404: "Resource not found",
    500: "Server error - Please try later",
    502: "Bad gateway",
    503: "Service unavailable",
    504: "Gateway timeout",
  };
  return messages[status] || `Error: ${status}`;
};

export default Axios;