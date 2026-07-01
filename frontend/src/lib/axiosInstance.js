import axios from "axios";
import { auth } from "../context/firebase";

const clearStaleAuth = () => {
  localStorage.removeItem("twitter-user");
  sessionStorage.removeItem("sessionId");
  sessionStorage.removeItem("firebaseToken");
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
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

export default axiosInstance;
