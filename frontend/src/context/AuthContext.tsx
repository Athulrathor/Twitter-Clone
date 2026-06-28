"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import axiosInstance from "../lib/axiosInstance";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  website: string;
  location: string;
}

interface sessionContents {
  _id: string;
  userId: string;
  firebaseUid: string;
  ipAddress: string;
  browser: string;
  isCurrent: boolean;
  os: string;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
  loginTime: string;
  location: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
  };
  status: "success" | "failed" | "pending" | "blocked" | "logged_out";
  logoutTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface AuthContextType {
  sessionData: sessionContents[] | null;
  firebaseUid: string | null;
  pagination: Pagination;
  page: number;
  user: User | null;
  login: (
    email: string,
    password: string,
  ) => Promise<
    | { requiresOtp: boolean; expiresAt: Date }
    | { requiresOtp: boolean; user: User }
    | null
  >;
  signup: (
    email: string,
    password: string,
    username: string,
    displayName: string,
  ) => Promise<void>;
  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  googlesignin: () => Promise<
    | { requiresOtp: boolean; expiresAt: Date }
    | { requiresOtp: boolean; user: User }
    | null
  >;
  fetchSession: (page?: number) => Promise<void>;
  logoutAll: () => Promise<void>;
  logoutOthers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<sessionContents[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();

          const res = await axiosInstance.get("/auth/me", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            withCredentials: true,
          });
          setFirebaseUid(res.data.user?.firebaseUid);
          setUser(res.data.user);
          sessionStorage.setItem("firebaseToken", res.data?.firebaseUid);
          localStorage.setItem("twitter-user", JSON.stringify(res.data.user));
        } else {
          setUser(null);

          localStorage.removeItem("twitter-user");
        }
      } catch (err) {
        console.error("Auth restore failed:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const usercred = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await usercred.user.getIdToken();

      const res = await axiosInstance.post(
        "/firebase/login",
        { loginMethod: "email" }, // request body (empty)
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        },
      );

      if (res.data.requiresOtp) {
        router.push("/verify-otp");
        setFirebaseUid(res.data?.firebaseUid);
        sessionStorage.setItem("sessionId", res.data.session._id);
        setSessionId(res.data.session._id);
        return {
          requiresOtp: true,
          expiresAt: res.data.expiresAt,
        };
      }
      sessionStorage.setItem("sessionId", res.data.session._id);
      setSessionId(res.data.session._id);
      setFirebaseUid(res.data?.firebaseUid);
      sessionStorage.setItem("firebaseToken", res.data?.firebaseUid);
      localStorage.setItem("twitter-user", JSON.stringify(res.data.user));

      return {
        requiresOtp: false,
        user: res.data.user,
      };
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string,
  ) => {
    try {
      setIsLoading(true);
      // Mock authentication - in real app, this would call an API
      const usercred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = usercred.user;
      const newuser: any = {
        username,
        displayName,
        avatar:
          user.photoURL ||
          "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
        email: user.email,
      };
      const idToken = await user.getIdToken();

      const res = await axiosInstance.post(
        "/firebase/login",
        {}, // request body (empty)
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        },
      );
      if (res.data) {
        setUser(res.data.user);
        localStorage.setItem("twitter-user", JSON.stringify(res.data.user));
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Auth signup failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      const sessionId = sessionStorage.getItem("sessionId");

      if (sessionId) {
        await axiosInstance.post("/auth/logout", {
          sessionId,
        });
      }

      await signOut(auth);

      setUser(null);
      setFirebaseUid(null);

      localStorage.removeItem("twitter-user");
      sessionStorage.removeItem("sessionId");
      sessionStorage.clear();

      router.push("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAll = async () => {
    try {
      setIsLoading(true);

      const token = await auth.currentUser?.getIdToken();

      await axiosInstance.post(
        "/auth/logout-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await signOut(auth);

      setUser(null);
      setFirebaseUid(null);

      localStorage.clear();
      sessionStorage.clear();

      router.push("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutOthers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const sessionId = sessionStorage.getItem("sessionId");

      await axiosInstance.post(
        "/auth/logout-others",
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await auth.currentUser?.getIdToken(true);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => {
    if (!user) return;

    setIsLoading(true);
    // Mock API call - in real app, this would call an API
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser: User = {
      ...user,
      ...profileData,
    };
    const res = await axiosInstance.patch(
      `/userupdate/${user.email}`,
      updatedUser,
    );
    if (res.data) {
      setUser(updatedUser);
      localStorage.setItem("twitter-user", JSON.stringify(updatedUser));
    }

    setIsLoading(false);
  };
  const googlesignin = async () => {
    try {
      setIsLoading(true);

      const result = await signInWithPopup(auth, new GoogleAuthProvider());

      const idToken = await result.user.getIdToken();

      const res = await axiosInstance.post(
        "/firebase/login",
        { loginMethod: "google" }, // request body (empty)
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        },
      );

      if (res.data.requiresOtp) {
        router.push("/verify-otp");
        setFirebaseUid(res.data?.firebaseUid);
        sessionStorage.setItem("sessionId", res.data.session._id);
        setSessionId(res.data.session._id);
        return {
          requiresOtp: true,
          expiresAt: res.data.expiresAt,
        };
      }
      sessionStorage.setItem("sessionId", res.data.session._id);
      setSessionId(res.data.session._id);
      setFirebaseUid(res.data?.firebaseUid);
      sessionStorage.setItem("firebaseToken", res.data?.firebaseUid);
      localStorage.setItem("twitter-user", JSON.stringify(res.data.user));

      return {
        requiresOtp: false,
        user: res.data.user,
      };
    } catch (err) {
      console.error("Auth signup failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSession = async (page: number = 1) => {
    try {
      setIsLoading(true);

      const token = await auth.currentUser?.getIdToken();

      const res = await axiosInstance.get(
        `/sessions/history?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSessionData(res.data.sessions);
      setPagination(res.data.pagination);
      setPage(page);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        updateProfile,
        logout,
        logoutAll,
        logoutOthers,
        isLoading,
        googlesignin,
        firebaseUid,
        fetchSession,
        sessionData,
        pagination,
        page,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
