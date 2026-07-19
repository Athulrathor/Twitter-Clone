"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { t } = useTranslation();

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    let generatedPassword = "";

    for (let i = 0; i < 12; i++) {
      generatedPassword += chars.charAt(
        Math.floor(Math.random() * chars.length),
      );
    }

    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!password) {
      return setError(t("validation.password_required"));
    }

    if (password !== confirmPassword) {
      return setError(t("validation.password_match"));
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
        notify.success(t("toast.password.reset_success"));
      }

      setMessage(t("auth.password_reset_redirect"));

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.failed"));
      notify.error(t("toast.password.reset_failed"));
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
            {t("auth.reset_password")}
          </CardTitle>

          <CardDescription className="text-gray-400">
            {t("auth.reset_password_description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder={t("auth.new_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
            />

            <Input
              type="password"
              placeholder={t("auth.confirm_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
            />

            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-700 text-white hover:bg-gray-900 rounded-full"
              onClick={generatePassword}
            >
              {t("auth.generate_password")}
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-200 rounded-full font-semibold"
            >
              {loading ? t("auth.resetting") : t("auth.reset_password")}
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
