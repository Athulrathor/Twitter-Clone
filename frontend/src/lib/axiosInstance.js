import axios from "axios";
import { auth } from "../context/firebase";
import { notify } from "./toast";

const clearStaleAuth = () => {
  localStorage.removeItem("twitter-user");
  sessionStorage.removeItem("sessionId");
  sessionStorage.removeItem("firebaseToken");
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  // headers: {
  //   "Content-Type": "application/json",
  // },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
    if (typeof window !== "undefined") {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const token = await currentUser.getIdToken();

        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          config.headers = { Authorization: `Bearer ${token}` };
        }
      } else {
        clearStaleAuth();
        if (config.headers && config.headers.Authorization) {
          delete config.headers.Authorization;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors centrally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      notify.error("Network error.");
      return Promise.reject(error);
    }

    // Special-case: backend signals account deleted (soft-delete) with 403 + code
    if (
      error.response.status === 403 &&
      error.response.data &&
      error.response.data.code === "ACCOUNT_DELETED"
    ) {
      try {
        error.isAccountDeleted = true;
        error.accountStatus = error.response.data;
      } catch (e) {
        // ignore
      }

      return Promise.reject(error);
    }

    switch (error.response.status) {
      case 400:
        notify.warning(error.response.data.message);
        break;

      case 401:
        notify.error("Session expired. Please login again.");
        break;

      case 403:
        notify.error(error.response.data.message);
        break;

      case 404:
        notify.warning("Resource not found.");
        break;

      case 409:
        notify.warning(error.response.data.message);
        break;

      case 422:
        notify.warning(error.response.data.message);
        break;

      case 429:
        notify.warning("Too many requests. Please try again later.");
        break;

      case 500:
        notify.error("Internal server error.");
        break;

      default:
        notify.error(error.response.data?.message || "Something went wrong.");
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
