"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(4 * 60 + 32);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [msg, setMsg] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const { firebaseUid,fetchSession,setUser } = useAuth();

  // countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatted = `${pad(Math.floor(timer / 60))}:${pad(timer % 60)}`;
  const otp = digits.join("");

  const clearMsg = () => setMsg(null);

  const handleChange = (val: string, idx: number) => {
    clearMsg();

    // handle paste of full code
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, "").slice(0, 6).split("");
      const next = [...digits];
      pasted.forEach((d, i) => {
        if (next[idx + i] !== undefined) next[idx + i] = d;
      });
      setDigits(next);
      const focusIdx = Math.min(idx + pasted.length, 5);
      refs.current[focusIdx]?.focus();
      return;
    }

    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
        const next = [...digits];
        next[idx - 1] = "";
        setDigits(next);
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    if (otp.length < 6 || loading) return;
    try {
      setLoading(true);
      clearMsg();
      const res = await axiosInstance.post("/login/verify", {
        otp,
        firebaseUid,
      });
      if (res.data.success) {
        setMsg({ text: "Verified! Logging you in…", type: "success" });
        setUser(res.data.user);
        await fetchSession();
        setTimeout(() => router.push("/"), 800);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Incorrect code. Check your email and try again.";
      setMsg({ text: message, type: "error" });
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    try {
      setResending(true);
      clearMsg();
      await axiosInstance.post("/login/otp", { firebaseUid, email });
      setDigits(Array(6).fill(""));
      setTimer(4 * 60 + 32);
      setCanResend(false);
      setMsg({ text: "A new code has been sent.", type: "success" });
      refs.current[0]?.focus();
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ text: "Failed to resend. Try again.", type: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center  px-4 py-10 max-md:p-0">
      <div className="w-full max-w-md">
        <Card
          className="
    w-full
    h-screen

    rounded-none
    border-0
    shadow-none

    bg-card

    md:h-auto
    md:max-w-md
    md:rounded-3xl
    md:border
    md:border-border
    md:shadow-2xl
  "
        >
          <CardContent
            className="
    flex
    h-full
    flex-col
    justify-center

    px-6
    py-8

    sm:px-8

    md:p-8
  "
          >
            {/* Logo / Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
                <Mail className="h-7 w-7 text-blue-500" />
              </div>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Verify your login
              </h1>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Enter the verification code sent to
              </p>

              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1 text-sm font-medium"
              >
                {email || "your@email.com"}
              </Badge>
            </div>

            {/* OTP */}
            <div
              className="mt-8 grid grid-cols-6 gap-2 sm:gap-3 w-full"
              role="group"
              aria-label="OTP"
            >
              {digits.map((digit, idx) => (
                <Input
                  key={idx}
                  ref={(el) => {
                    refs.current[idx] = el;
                  }}
                  value={digit}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onFocus={(e) => e.target.select()}
                  className={cn(
                    "aspect-square w-full min-w-2",
                    "rounded-xl",
                    "text-center font-bold",
                    "text-lg sm:text-xl",
                    "bg-background",
                    "border-border",
                    "transition-all",
                    "focus-visible:ring-2 focus-visible:ring-blue-500",
                    msg?.type === "error"
                      ? "border-red-500"
                      : digit
                        ? "border-blue-500"
                        : "",
                  )}
                />
              ))}
            </div>

            {/* Alert */}
            <div className="mt-6 h-14">
              {msg && (
                <Alert
                  variant={msg.type === "error" ? "destructive" : "default"}
                >
                  {msg.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <CircleAlert className="h-4 w-4" />
                  )}

                  <AlertDescription>{msg.text}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Verify */}
            <Button
              size="lg"
              className="
    mt-8
    h-12
    w-full
    rounded-full cursor-pointer
    disabled:opacity-50
    disabled:cursor-not-allowed
    enabled:cursor-pointer
  "
              disabled={otp.length < 6 || loading}
              onClick={handleVerify}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify OTP
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Timer */}
            <Separator className="my-6" />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-4 w-4" />

                {!canResend ? (
                  <span>{formatted}</span>
                ) : (
                  <span>Code expired</span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={!canResend || resending}
                onClick={handleResend}
                className={`rounded-full disabled:text-muted-foreground
    disabled:opacity-50
    disabled:cursor-not-allowed
    enabled:cursor-pointer`}
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice
        <Card className="mt-6 border-border bg-card">
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-500 shrink-0" />

            <div>
              <h3 className="font-semibold">Secure Login Verification</h3>

              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                This verification protects your account from unauthorized
                access. The OTP is valid for 5 minutes and can only be used
                once.
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
