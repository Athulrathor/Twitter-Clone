"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!emailOrPhone.trim()) {
      return setError("Please enter your email or phone number");
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrPhone: emailOrPhone.trim(),
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
        notify.success("Password reset link send successfully!");
      }

      setMessage(data.message);
      setEmailOrPhone("");
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      notify.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-black flex items-center justify-center px-4">
    <Card className="w-full max-w-md bg-black border border-gray-800 shadow-xl">
      <CardHeader className="space-y-4 text-center">
        <div className="text-5xl font-bold text-white">
          𝕏
        </div>

        <CardTitle className="text-2xl text-white">
          Forgot Password
        </CardTitle>

        <CardDescription className="text-gray-400">
          Enter your registered email address or phone number to receive a password reset link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Input
            type="text"
            placeholder="Email or Phone Number"
            value={emailOrPhone}
            onChange={(e) =>
              setEmailOrPhone(e.target.value)
            }
            className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-200 rounded-full font-semibold"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </Button>

          {message && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-400 text-center">
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400 text-center">
                {error}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  </div>
);
}
