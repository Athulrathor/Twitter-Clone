"use client";

import { useCallback, useState } from "react";

export enum AuthenticationPurpose {
  AUDIO_UPLOAD = "AUDIO_UPLOAD",
  VERIFY_EMAIL = "VERIFY_EMAIL",
  CHANGE_LANGUAGE = "CHANGE_LANGUAGE",
}

export type AuthenticationState =
  | "idle"
  | "sending"
  | "otp"
  | "verifying"
  | "success";

export interface AuthenticationRequest {
  purpose: AuthenticationPurpose;
  title: string;
  description: string;
  successTitle?: string;
  successDescription?: string;
  confirmText?: string;
  cancelText?: string;
  onSendOtp: () => Promise<void>;
  onVerifyOtp: (otp: string) => Promise<boolean>;
  onVerified?: () => Promise<void> | void;
  onCancel?: () => void;
}

interface UseAuthenticationReturn {
  open: boolean;
  state: AuthenticationState;
  request: AuthenticationRequest | null;
  otp: string;
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
  const [state, setState] =
    useState<AuthenticationState>("idle");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const [request, setRequest] =
    useState<AuthenticationRequest | null>(null);

  const reset = useCallback(() => {
    setOpen(false);
    setState("idle");
    setOtp("");
    setError("");
    setRequest(null);
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
      try {
        setRequest(request);
        setOpen(true);
        setError("");
        setOtp("");
        setState("sending");
        await request.onSendOtp();
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

  const verify = useCallback(async () => {
    if (!request) return;
    try {
      setError("");
      setState("verifying");
      const verified =
        await request.onVerifyOtp(otp);
      if (!verified) {
        setState("otp");
        setError("Invalid verification code.");
        return;
      }
      setState("success");
      await new Promise((resolve) =>
        setTimeout(resolve, SUCCESS_DELAY)
      );
      await request.onVerified?.();
      reset();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ??
          "Verification failed."
      );
      setState("otp");
    }
  }, [otp, request, reset]);

  return {
    open,
  state,
  request,
  otp,
  setOtp,
  error,
  start,
  verify,
  cancel,
  close,
  reset,
  };
}