"use client";

import { useState } from "react";
import { Languages } from "lucide-react";

import { DropdownMenuItem } from "./ui/dropdown-menu";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

import axiosInstance from "@/lib/axiosInstance";
import { notify } from "@/lib/toast";

import AuthenticationDialog from "@/modals/authenticationModal/AuthenticationDialogCard";
import useAuthentication, {
  AuthenticationPurpose,
} from "@/modals/authenticationModal/useAuthenticationHook";

import LanguageSelectionDialog, {
  LanguageCode,
} from "@/components/languages/LanguageSelectionDialog";

import {
  requestLanguageOtp,
  verifyLanguageOtp,
} from "@/components/languages/service/languageService";

export default function LanguageSwitcher() {
  const auth = useAuthentication();
  const { language, changeLanguage } = useLanguage();
  const { user, firebaseUid, setUser } = useAuth();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode | null>(null);

  const handleLanguageSelected = (code: LanguageCode) => {
    if (!user || !firebaseUid) return;

    setSelectedLanguage(code);

    setSelectorOpen(false);

    auth.start({
      purpose: AuthenticationPurpose.CHANGE_LANGUAGE,

      title: "Verify Language Change",

      description:
        "Verify your identity before changing your language.",

      confirmText: "Verify",

      onSendOtp: async () => {
        await requestLanguageOtp({
          firebaseUid,
          email: user.email,
          language: code,
        });
      },

      onVerifyOtp: async (otp) => {
        const res = await verifyLanguageOtp({
          firebaseUid,
          otp,
        });

        return res.data.success;
      },

      onVerified: async () => {
        try {
          setSaving(true);

          await axiosInstance.patch("/user/language", {
            language: code,
          });

          await changeLanguage(code);

          if (user) {
            setUser({
              ...user,
              language: code,
            });
          }

          notify.success("Language changed successfully.");
        } catch (err) {
          console.error(err);
          notify.error("Failed to change language.");
        } finally {
          setSaving(false);
          setSelectedLanguage(null);
        }
      },
    });
  };

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          setSelectorOpen(true);
        }}
        className="cursor-pointer"
      >
        <Languages className="mr-2 h-4 w-4" />
        Language
      </DropdownMenuItem>

      <LanguageSelectionDialog
        open={selectorOpen}
        currentLanguage={language as LanguageCode}
        loading={saving}
        onClose={() => setSelectorOpen(false)}
        onApply={handleLanguageSelected}
      />

      <AuthenticationDialog flow={auth} />
    </>
  );
}