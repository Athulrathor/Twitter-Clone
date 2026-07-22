"use client";

import { Languages } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { useTranslation } from "react-i18next";
import { notify } from "@/lib/toast";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "hi", label: "हिन्दी" },
  { code: "pt", label: "Português" },
  { code: "zh", label: "中文" },
  { code: "fr", label: "Français" },
] as const;

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]["code"];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const { user, setUser } = useAuth();
  const { t } = useTranslation();

  const handleSelect = async (code: LanguageCode) => {
    if (code === language) return;

    try {
      await changeLanguage(code);

      if (user) {
        await axiosInstance.patch("/user/language", { language: code });
        setUser({ ...user, language: code });
      }
    } catch (err) {
      console.error(err);
      notify.error(t("failed"));
    }
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer hover:bg-gray-900 focus:bg-gray-900">
        <Languages className="mr-2 h-4 w-4" />
        {t("language")}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="bg-black border-gray-800 text-white">
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => void handleSelect(option.code)}
            className={`cursor-pointer hover:bg-gray-900 focus:bg-gray-900 ${
              language === option.code ? "font-semibold text-blue-400" : ""
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
