"use client";

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import axiosInstance from "../lib/axiosInstance";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { socket } from "@/lib/socket";
import { requestNotificationPermission } from "@/lib/notification";
import LoadingSpinner from "@/components/loading-spinner";

interface User {
  _id: string;
  username: string;
  displayName: string;
  phoneNumber: string;
  phoneVerified: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  website: string;
  location: string;
  deleteAt?: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
  scheduledDeleteAt?: Date;
  restoreAt?: Date;
  notificationEnabled?: boolean;
  language?: "en" | "es" | "hi" | "pt" | "zh" | "fr";
}

interface SessionStats {
  activeCount: number;
  blockedCount: number;
  otpCount: number;
  deviceCount: number;
}

export interface SessionContents {
  _id: string;
  userId: string;
  firebaseUid: string;

  ipAddress: string;
  browser: string;
  os: string;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";

  loginMethod: "google" | "email";

  status:
    | "pending"
    | "active"
    | "logged_out"
    | "failed"
    | "blocked"
    | "expired";

  otpVerified: boolean;
  otpVerifiedAt?: string;

  loginTime: string;
  logoutTime?: string;
  lastActiveAt: string;

  expiresAt?: string;

  userAgent?: string;
  deviceName?: string;

  blockedAt?: string;
  blockedReason?: string;

  tokenVersion: number;

  isCurrent: boolean;

  location: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
  };

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

type AccountStatusPayload = {
  code?: string;
  message?: string;
  deletedAt?: string | Date | null;
  scheduledDeleteAt?: string | Date | null;
  restoreAt?: string | Date | null;
  isDeleted?: boolean;
  success?: boolean;
};

interface AccountDeletedResponse extends AccountStatusPayload {}

interface FirebaseLoginResponse extends AccountStatusPayload {
  requiresOtp?: boolean;
  expiresAt?: string;
  session: { _id: string };
  user?: User;
  email?: string;
  firebaseUid?: string;
}

interface AuthContextType {
  sessionId: string | null;
  sessionData: SessionContents[] | null;
  currentSession: SessionContents | null;
  accountStatus: {code: string, deletedAt?: string, isDeleted?: boolean, message?: string, restoreAt?: string, scheduledDeleteAt?: string, success?: boolean} | null;
  sessionLoading: boolean;
  isInitializing: boolean;
  authLoading: boolean;
  profileLoading: boolean;
  stats: SessionStats | null;
  firebaseUid: string | null;
  pagination: Pagination;
  page: number;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (
    email: string,
    password: string,
  ) => Promise<
    | {
        requiresOtp: boolean;
        expiresAt: Date;
        displayName?: string;
        user?: User;
      }
    | { requiresOtp: boolean; user: User; displayName?: string }
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
  logout: (sessionId: string) => Promise<void>;
  googlesignin: () => Promise<
    | {
        requiresOtp: boolean;
        expiresAt: Date;
        displayName?: string;
        user: User;
      }
    | { requiresOtp: boolean; user: User; displayName?: string }
    | undefined
  >;
  fetchSession: (page?: number) => Promise<void>;
  logoutAll: () => Promise<void>;
  logoutOthers: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>;
  fetchDeleteAccount: () => Promise<{
    success: boolean;
    message: string;
    deleteAt: Date;
    user: User;
  } | null>;
  fetchRecoverAccount: () => Promise<{
    success: boolean;
    message: string;
    user: User;
  } | null>;
  fetchDeleteStatus: () => Promise<{
    success: boolean;
    data: User;
    message: string;
  } | null>;
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
  const [authLoading, setAuthLoading] = useState(false);
  const [accountStatus] = useState<{code: string, deletedAt?: string, isDeleted?: boolean, message?: string, restoreAt?: string, scheduledDeleteAt?: string, success?: boolean} | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionContents[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionContents | null>(
    null,
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isInitializing, setIsInitializing] = useState(true);
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
          setFirebaseUid(res.data?.firebaseUid);
          setUser(res.data.user);
          sessionStorage.setItem("firebaseToken", res.data?.firebaseUid);
          localStorage.setItem("twitter-user", JSON.stringify(res.data.user));
        } else {
          setUser(null);

          localStorage.removeItem("twitter-user");
          sessionStorage.removeItem("sessionId");
          sessionStorage.removeItem("firebaseToken");
        }
      } catch (err) {
        console.error(err);
        if (!user) {
          console.log("user not found")
        };
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const id =
      sessionStorage.getItem("sessionId") ?? localStorage.getItem("sessionId");

    setSessionId(id);
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    socket.connect();

    socket.emit("join", user._id);

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const showNotification = (data: { title: string; body: string }) => {
    if (Notification.permission !== "granted") return;

    new Notification(data.title, {
      body: data.body,
      icon: "/logo.png",
    });
  };

  useEffect(() => {
    if (!user?.notificationEnabled) return;

    socket.on("keyword-notification", showNotification);

    return () => {
      socket.off("keyword-notification", showNotification);
    };
  }, [user?.notificationEnabled]);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <LoadingSpinner className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const clearClientAuthState = () => {
    setUser(null);
    setFirebaseUid(null);
    setSessionId(null);
    localStorage.removeItem("twitter-user");
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("firebaseToken");
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<
    | { requiresOtp: boolean; expiresAt: Date; displayName?: string }
    | { requiresOtp: boolean; user: User; displayName?: string }
    | null
  > => {
    try {
      setAuthLoading(true);

      const usercred = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await usercred.user.getIdToken();

      const res = await axiosInstance.post<FirebaseLoginResponse>(
        "/firebase/login",
        { loginMethod: "email" },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        },
      );

      if (res?.data && (res.data as AccountDeletedResponse).code === "ACCOUNT_DELETED") {
        const payload = res.data as AccountDeletedResponse;
        const err: any = new Error(payload.message || "Account deleted");
        err.isAccountDeleted = true;
        err.accountStatus = payload;
        err.response = { data: payload };
        throw err;
      }

      if (res.data.requiresOtp) {
        const email = res.data?.user?.email ?? res.data?.email;
        setFirebaseUid(res.data?.firebaseUid ?? null);
        sessionStorage.setItem("sessionId", res.data.session._id);
        setSessionId(res.data.session._id);
        if (email) {
          router.push(`/verify-otp/${email}`);
        }
        return {
          requiresOtp: true,
          expiresAt: res.data.expiresAt
            ? new Date(res.data.expiresAt)
            : new Date(),
          displayName: res.data?.user?.displayName,
        };
      }
      sessionStorage.setItem("sessionId", res.data.session._id);
      setSessionId(res.data.session._id);
      setFirebaseUid(res.data?.firebaseUid ?? null);
      const resolvedUser = res.data.user;
      if (resolvedUser) {
        setUser(resolvedUser);
        sessionStorage.setItem("firebaseToken", res.data?.firebaseUid ?? "");
        localStorage.setItem("twitter-user", JSON.stringify(resolvedUser));
      }
      await requestNotificationPermission();
      return {
        requiresOtp: false,
        user: resolvedUser as User,
        displayName: res.data?.user?.displayName,
      };
    } catch (error: unknown) {
      console.error(error);

      const isAccountDeletedError = (
        candidate: unknown,
      ): candidate is {
        isAccountDeleted?: boolean;
        accountStatus?: AccountDeletedResponse;
      } => {
        return (
          typeof candidate === "object" &&
          candidate !== null &&
          "isAccountDeleted" in candidate &&
          (candidate as { isAccountDeleted?: unknown }).isAccountDeleted === true
        );
      };

      if (isAccountDeletedError(error)) {
        // Preserve the Firebase auth session so the restore endpoint can still
        // obtain a valid token and authorize the restore request.
        throw error;
      }

      try {
        await signOut(auth);
      } catch {
        // Ignore sign-out cleanup errors and keep the user on the landing page.
      }
      clearClientAuthState();
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const googlesignin = async (): Promise<
    | {
        requiresOtp: boolean;
        expiresAt: Date;
        displayName?: string;
        user: User;
      }
    | { requiresOtp: boolean; user: User; displayName?: string }
    | undefined
  > => {
    try {
      setAuthLoading(true);

      const result = await signInWithPopup(auth, new GoogleAuthProvider());

      const idToken = await result.user.getIdToken();

      const res = await axiosInstance.post<FirebaseLoginResponse>(
        "/firebase/login",
        { loginMethod: "google" },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        },
      );

      if (res?.data && (res.data as AccountDeletedResponse).code === "ACCOUNT_DELETED") {
        const payload = res.data as AccountDeletedResponse;
        const err: any = new Error(payload.message || "Account deleted");
        err.isAccountDeleted = true;
        err.accountStatus = payload;
        err.response = { data: payload };
        throw err;
      }

      if (res.data.requiresOtp) {
        const email = res.data?.user?.email ?? res.data?.email;
        setFirebaseUid(res.data?.firebaseUid ?? null);
        sessionStorage.setItem("sessionId", res.data.session._id);
        notify.success("OTP sent successfully.");
        setSessionId(res.data.session._id);
        if (email) {
          router.push(`/verify-otp/${email}`);
        }
        return {
          requiresOtp: true,
          expiresAt: res.data.expiresAt
            ? new Date(res.data.expiresAt)
            : new Date(),
          displayName: res.data?.user?.displayName,
          user: res.data?.user as User,
        };
      }
      sessionStorage.setItem("sessionId", res.data.session._id);
      setSessionId(res.data.session._id);
      setFirebaseUid(res.data?.firebaseUid ?? null);
      const resolvedUser = res.data.user;
      if (resolvedUser) {
        setUser(resolvedUser);
        notify.success(`Welcome back, ${resolvedUser.displayName}`);
        sessionStorage.setItem("firebaseToken", res.data?.firebaseUid ?? "");
        localStorage.setItem("twitter-user", JSON.stringify(resolvedUser));
      }

      return {
        requiresOtp: false,
        user: resolvedUser as User,
      };
    } catch (err: unknown) {
      const isAccountDeletedError = (
        candidate: unknown,
      ): candidate is {
        isAccountDeleted?: boolean;
        accountStatus?: AccountDeletedResponse;
      } => {
        return (
          typeof candidate === "object" &&
          candidate !== null &&
          "isAccountDeleted" in candidate &&
          (candidate as { isAccountDeleted?: unknown }).isAccountDeleted === true
        );
      };

      if (isAccountDeletedError(err)) {
        // Preserve Firebase auth state so restore can still use the signed-in user.
        throw err;
      }
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string,
  ) => {
    try {
      setAuthLoading(true);
      // Create the Firebase user and apply the display name.
      const usercred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = usercred.user;

      if (displayName.trim()) {
        await firebaseUpdateProfile(firebaseUser, { displayName });
      }

      const idToken = await firebaseUser.getIdToken();
      const res = await axiosInstance.post(
        "/firebase/login",
        { loginMethod: "email" },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        },
      );
      if (res.data) {
        setUser(res.data.user);
        localStorage.setItem("twitter-user", JSON.stringify(res.data.user));
      }
      console.log("Signup completed for", username, displayName);
      setAuthLoading(false);
    } catch (err: unknown) {
      console.error("Auth signup failed:", err);

      const isAccountDeletedError = (
        candidate: unknown,
      ): candidate is {
        isAccountDeleted?: boolean;
      } => {
        return (
          typeof candidate === "object" &&
          candidate !== null &&
          "isAccountDeleted" in candidate &&
          (candidate as { isAccountDeleted?: unknown }).isAccountDeleted === true
        );
      };

      if (isAccountDeletedError(err)) {
        // Preserve Firebase auth state so the restore endpoint can still use the
        // signed-in user's ID token.
        throw err;
      }
      try {
        await signOut(auth);
      } catch {
        // Ignore sign-out cleanup errors.
      }
      clearClientAuthState();
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async (id: string) => {
    try {
      if (id) {
        const token = await auth.currentUser?.getIdToken();

        await axiosInstance.post("/auth/logout", id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      await signOut(auth);

      setUser(null);
      setFirebaseUid(null);

      localStorage.removeItem("twitter-user");
      sessionStorage.removeItem("sessionId");
      sessionStorage.clear();

      router.push("/");
    } catch (err: unknown) {
      console.log(err);
    }
  };

  const logoutAll = async () => {
    try {
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

      router.push("/");
    } catch (err) {
      console.error(err);
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
      await fetchSession(page);
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

    setProfileLoading(true);

    const token = await auth.currentUser?.getIdToken();

    const updatedUser: User = {
      ...user,
      ...profileData,
    };
    const res = await axiosInstance.patch(`/userupdate`, updatedUser, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    if (res.data) {
      setUser(updatedUser);
      localStorage.setItem("twitter-user", JSON.stringify(updatedUser));
    }

    setProfileLoading(false);
  };

  const fetchSession = async (page: number = 1) => {
    try {
      setSessionLoading(true);

      const sessionId = sessionStorage.getItem("sessionId")
        ? sessionStorage.getItem("sessionId")
        : localStorage.getItem("sessionId");

      const token = await auth.currentUser?.getIdToken();

      const res = await axiosInstance.get(
        `/sessions/history?page=${page}&limit=10&sessionId=${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSessionData(res.data.sessions);
      if (res.data.currentSession) {
        setCurrentSession(res.data.currentSession);
      }
      setStats(res.data.stats);
      setPagination(res.data.pagination);
      setPage(page);
    } finally {
      setSessionLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      const userFirebase = auth.currentUser;

      if (!userFirebase) {
        throw new Error("User not authenticated");
      }

      const hasPasswordProvider = userFirebase.providerData.some(
        (provider) => provider.providerId === "password",
      );

      if (!hasPasswordProvider) {
        throw new Error("This account doesn't have a password.");
      }

      const credential = EmailAuthProvider.credential(
        userFirebase.email!,
        currentPassword,
      );

      await reauthenticateWithCredential(userFirebase, credential);

      const token = await userFirebase.getIdToken(true);

      const response = await axiosInstance.post(
        "/auth/change-password",
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const fetchDeleteAccount = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await axiosInstance.get(`/auth/delete-account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const fetchRecoverAccount = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await axiosInstance.get(`/auth/restore-account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const fetchDeleteStatus = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await axiosInstance.get(`/auth/account-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
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
        isInitializing,
        authLoading,
        sessionLoading,
        profileLoading,
        googlesignin,
        firebaseUid,
        fetchSession,
        setUser,
        sessionData,
        pagination,
        page,
        sessionId,
        currentSession,
        stats,
        accountStatus,
        changePassword,
        fetchDeleteAccount,
        fetchRecoverAccount,
        fetchDeleteStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
