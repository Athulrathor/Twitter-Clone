"use client";

import { useCallback, useState } from "react";

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

  /**
   * Any extra data needed for this authentication.
   * Examples:
   * - phone number
   * - selected language
   * - email
   */

  phoneNumber?: string;
  payload?: T;
  onSendOtp: (payload?: T) => Promise<void>;
  onVerifyOtp: (otp: string, payload?: T) => Promise<boolean>;
  onVerified?: (payload?: T) => Promise<void> | void;
  onCancel?: () => void;
}

interface UseAuthenticationReturn {
  open: boolean;
  state: AuthenticationState;
  request: AuthenticationRequest | null;
  otp: string;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  sendPhoneOtp: () => Promise<void>;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  start: (request: AuthenticationRequest) => Promise<void>;
  verify: () => Promise<void>;
  cancel: () => void;
  close: () => void;
  reset: () => void;
}

const SUCCESS_DELAY = 800;

export default function useAuthentication(): UseAuthenticationReturn {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AuthenticationState>("idle");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [request, setRequest] = useState<AuthenticationRequest | null>(null);

  const reset = useCallback(() => {
    setOpen(false);
    setState("idle");
    setOtp("");
    setError("");
    setRequest(null);
    setPhoneNumber("");
  }, []);

  const close = useCallback(() => {
    reset();
  }, [reset]);

  const cancel = useCallback(() => {
    request?.onCancel?.();
    reset();
  }, [request, reset]);

  const start = useCallback(
    async (request: AuthenticationRequest) => {
      setRequest(request);
      setOpen(true);
      setOtp("");
      setError("");

      if (request.purpose === AuthenticationPurpose.PHONE_VERIFICATION) {
        setPhoneNumber(request.phoneNumber ?? "");
        setState("phone");
        return;
      }

      try {
        setState("sending");
        await request.onSendOtp(request.payload);
        setState("otp");
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ?? "Unable to send verification code.",
        );
        reset();
      }
    },
    [reset],
  );

  const sendPhoneOtp = useCallback(async () => {
    if (!request) return;

    try {
      setError("");
      setState("sending");

      request.phoneNumber = phoneNumber;

      await request.onSendOtp({
        ...(request.payload as object),
        phoneNumber,
      });

      setState("otp");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ?? "Unable to send verification code.",
      );

      setState("phone");
    }
  }, [phoneNumber, request]);

  const verify = useCallback(async () => {
    if (!request) return;
    try {
      setError("");
      setState("verifying");
      const verified = await request.onVerifyOtp(otp);
      if (!verified) {
        setState("otp");
        setError("Invalid verification code.");
        return;
      }
      setState("success");
      await new Promise((resolve) => setTimeout(resolve, SUCCESS_DELAY));
      await request.onVerified?.();
      reset();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? "Verification failed.");
      setState("otp");
    }
  }, [otp, request, reset]);

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
