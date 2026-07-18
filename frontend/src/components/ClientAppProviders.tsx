"use client";

import "@/i18n";

import { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export function ClientAppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </LanguageProvider>
  );
}