"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import i18n from "@/i18n";

type Language =
  | "en"
  | "es"
  | "hi"
  | "pt"
  | "zh"
  | "fr";

interface LanguageContextType {
  language: Language;
  changeLanguage: (language: Language) => Promise<void>;
}

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "es",
  "hi",
  "pt",
  "zh",
  "fr",
];

function isSupportedLanguage(
  value: string | null,
): value is Language {
  return (
    value !== null &&
    SUPPORTED_LANGUAGES.includes(value as Language)
  );
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] =
    useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "language",
    );

    if (isSupportedLanguage(savedLanguage)) {
      setLanguage(savedLanguage);
      void i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = useCallback(async (newLanguage: Language) => {
    if (!isSupportedLanguage(newLanguage)) return;

    setLanguage(newLanguage);

    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
    }

    await i18n.changeLanguage(newLanguage);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider.",
    );
  }

  return context;
}
