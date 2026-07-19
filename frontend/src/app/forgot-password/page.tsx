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
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!emailOrPhone.trim()) {
      return setError(t("validation.email_or_phone_required"));
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
      }

      notify.success(t("toast.password.reset_sent"));

      setMessage(t("toast.password.reset_sent"));
      setEmailOrPhone("");
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t("common.failed"));
      notify.error(err instanceof Error ? err.message : t("common.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-black border border-gray-800 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="text-5xl font-bold text-white">𝕏</div>

          <CardTitle className="text-2xl text-white">
            {t("auth.forgot_password")}
          </CardTitle>

          <CardDescription className="text-gray-400">
            {t("auth.forgot_password_description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder={t("auth.email_or_phone")}
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-200 rounded-full font-semibold"
            >
              {loading ? t("auth.sending") : t("auth.send_reset_link")}
            </Button>

            {message && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm text-green-400 text-center">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
