"use client";

import "@/i18n";

import { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import PhoneVerificationGuard from "./PhoneVerificationQuard";

export function ClientAppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PhoneVerificationGuard />
        {children}
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </LanguageProvider>
  );
}