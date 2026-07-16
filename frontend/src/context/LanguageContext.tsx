"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
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

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] =
    useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "language"
    ) as Language | null;

    if (savedLanguage) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = async (
    newLanguage: Language
  ) => {
    setLanguage(newLanguage);

    localStorage.setItem(
      "language",
      newLanguage
    );

    await i18n.changeLanguage(newLanguage);
  };

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
      "useLanguage must be used inside LanguageProvider."
    );
  }

  return context;
}