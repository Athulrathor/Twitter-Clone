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

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
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
  googlesignin: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();

          const res = await axiosInstance.post(
            "/firebase/login",
            { idToken },
            {
              withCredentials: true,
            },
          );

          setUser(res.data.user);

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
        { idToken },
        {
          withCredentials: true,
        },
      );

      setUser(res.data.user);

      localStorage.setItem("twitter-user", JSON.stringify(res.data.user));
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
      { idToken },
      {
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
    setUser(null);
    await signOut(auth);
    localStorage.removeItem("twitter-user");
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
        { idToken },
        {
          withCredentials: true,
        },
      );

      setUser(res.data.user);

      localStorage.setItem("twitter-user", JSON.stringify(res.data.user));
    } catch (err) {
        console.error("Auth signup failed:", err);
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
        isLoading,
        googlesignin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
