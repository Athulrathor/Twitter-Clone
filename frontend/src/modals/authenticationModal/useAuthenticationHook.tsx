"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export enum AuthenticationPurpose {
  VERIFY_EMAIL = "VERIFY_EMAIL",
  AUDIO_UPLOAD = "AUDIO_UPLOAD",
  CHANGE_LANGUAGE = "CHANGE_LANGUAGE",
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
}

export type AuthenticationState =
  | "idle"
  | "phone"
  | "sending"
  | "otp"
  | "verifying"
  | "success";

export interface AuthenticationRequest<T = unknown> {
  purpose: AuthenticationPurpose;

  title: string;
  description: string;

  successTitle?: string;
  successDescription?: string;

  confirmText?: string;
  cancelText?: string;

  payload?: T;

  onSendOtp: (payload?: T) => Promise<void>;

  onVerifyOtp: (
    otp: string,
    payload?: T
  ) => Promise<boolean>;

  onVerified?: (
    payload?: T
  ) => Promise<void> | void;

  onCancel?: () => void;
}

interface PhonePayload {
  phoneNumber: string;
  purpose: string;
  email?: string;
  language?: string;
  firebaseUid: string;
}

interface UseAuthenticationReturn {
  open: boolean;
  state: AuthenticationState;
  request: AuthenticationRequest<any> | null;
  otp: string;
  setOtp: React.Dispatch<
    React.SetStateAction<string>
  >;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<
    React.SetStateAction<string>
  >;
  error: string;
  start: (
    request: AuthenticationRequest<any>
  ) => Promise<void>;
  sendPhoneOtp: () => Promise<void>
  verify: () => Promise<void>;
  cancel: () => void;
  close: () => void;
  reset: () => void;
}

const SUCCESS_DELAY = 800;

export default function useAuthentication(): UseAuthenticationReturn {
  const [open, setOpen] = useState(false);
  const { user,firebaseUid } = useAuth();
  const [state, setState] =
    useState<AuthenticationState>("idle");
  const [request, setRequest] =
    useState<AuthenticationRequest<any> | null>(
      null
    );
  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] =
    useState("");
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setOpen(false);
    setState("idle");
    setRequest(null);
    setOtp("");
    setPhoneNumber("");
    setError("");
  }, []);

  const close = useCallback(() => {
    reset();
  }, [reset]);

  const cancel = useCallback(() => {
    request?.onCancel?.();

    reset();
  }, [request, reset]);

  const start = useCallback(
    async (
      authenticationRequest: AuthenticationRequest<any>
    ) => {
      setRequest(authenticationRequest);
      setOpen(true);
      setOtp("");
      setPhoneNumber("");
      setError("");
      if (
        authenticationRequest.purpose ===
        AuthenticationPurpose.PHONE_VERIFICATION
      ) {
        setState("phone");
        return;
      }

      try {
        setState("sending");

        await authenticationRequest.onSendOtp(
          authenticationRequest.payload
        );

        setState("otp");
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ??
            "Unable to send verification code."
        );

        reset();
      }
    },
    [reset]
  );

  const sendPhoneOtp = useCallback(async () => {
    if (!request || !firebaseUid || !user) return;

    try {
      setError("");

      setState("sending");

      const payload: PhonePayload = {
        purpose: AuthenticationPurpose.PHONE_VERIFICATION,
        phoneNumber,
        firebaseUid,
        email: user?.email
      };

      await request.onSendOtp(payload);

      setState("otp");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ??
          "Unable to send verification code."
      );

      setState("phone");
    }
  }, [phoneNumber, request]);

  const verify = useCallback(async () => {
    if (!request) return;

    try {
      setError("");

      setState("verifying");

      const payload = {
        phoneNumber,
      };

      const verified =
        await request.onVerifyOtp(
          otp,
          payload
        );

      if (!verified) {
        setState("otp");

        setError(
          "Invalid verification code."
        );

        return;
      }

      setState("success");

      await new Promise((resolve) =>
        setTimeout(resolve, SUCCESS_DELAY)
      );

      await request.onVerified?.(payload);

      reset();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ??
          "Verification failed."
      );

      setState("otp");
    }
  }, [
    otp,
    phoneNumber,
    request,
    reset,
  ]);

  return {
    open,
    state,
    request,
    otp,
    setOtp,
    phoneNumber,
    setPhoneNumber,
    error,
    start,
    sendPhoneOtp,
    verify,
    cancel,
    close,
    reset,
  };
}