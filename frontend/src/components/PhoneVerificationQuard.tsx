"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthenticationDialog from "@/modals/authenticationModal/AuthenticationDialogCard";
import useAuthentication, {
  AuthenticationPurpose,
} from "@/modals/authenticationModal/useAuthenticationHook";

import axiosInstance from "@/lib/axiosInstance";
import {
  requestLanguageOtp,
  verifyLanguageOtp,
} from "./languages/service/languageService";
import { auth } from "../context/firebase";

async function getToken() {
  return await auth.currentUser?.getIdToken();
}

export default function PhoneVerificationGuard() {
  const { user, firebaseUid, setUser, isInitializing } = useAuth();

  const auth = useAuthentication();

  const hasTriggered = useRef(false);

  useEffect(() => {
    if (isInitializing) return;

  if (!user || !firebaseUid) return;

  if (hasTriggered.current) return;

  // Don't show if account deleted
  if (user.isDeleted) return;

  // Don't show if phone already exists
  if (user.phoneNumber) return;

  hasTriggered.current = true;

    auth.start({
      purpose: AuthenticationPurpose.PHONE_VERIFICATION,

      title: "Add Phone Number",

      description: "Add your phone number to secure your account.",

      onSendOtp: async (payload: { phoneNumber?: string } | undefined) => {
        if (!payload || !payload.phoneNumber) {
          throw new Error("phoneNumber is required to send OTP");
        }

        await requestLanguageOtp({
          firebaseUid,
          phoneNumber: payload.phoneNumber,
          email: user.email,
          purpose: AuthenticationPurpose.PHONE_VERIFICATION,
        });
      },

      onVerifyOtp: async (otp: string) => {
        const res = await verifyLanguageOtp({
          firebaseUid,
          otp,
          purpose: AuthenticationPurpose.PHONE_VERIFICATION,
        });

        return Boolean(res.data.success);
      },

      onVerified: async (payload?: { phoneNumber?: string }) => {
        if (!payload?.phoneNumber) {
          throw new Error("phoneNumber is required to verify");
        }

        const token = await getToken();

        await axiosInstance.patch(
          "/user/phone",
          {
            phoneNumber: payload.phoneNumber,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        );

        setUser({
          ...user,
          phoneNumber: payload.phoneNumber,
        });
      },
    });
  }, [user, firebaseUid, isInitializing]);

  return <AuthenticationDialog flow={auth} />;
}
