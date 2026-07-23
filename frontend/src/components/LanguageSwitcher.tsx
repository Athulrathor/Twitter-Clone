"use client";

import { Languages } from "lucide-react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
// import { useTranslation } from "react-i18next";
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
import { useState } from "react";

export default function LanguageSwitcher() {
  const auth = useAuthentication();

  const { language, changeLanguage } = useLanguage();

  const { user, firebaseUid, setUser } = useAuth();

  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleOpenAuthentication = () => {
    if (!user || !firebaseUid) return;

    auth.start({
      purpose: AuthenticationPurpose.CHANGE_LANGUAGE,

      title: "Verify Language Change",

      description: "Verify your identity before changing your language.",

      confirmText: "Verify",

      onSendOtp: async () => {
        await requestLanguageOtp({ firebaseUid, email: user.email });
      },

      onVerifyOtp: async (otp) => {
        const res = await verifyLanguageOtp({
          firebaseUid,
          otp,
        });

        return res.data.success;
      },

      onVerified: async () => {
        setLanguageDialogOpen(true);
      },
    });
  };

  const handleApplyLanguage = async (code: LanguageCode) => {
    if (code === language) return;
    try {
      setSaving(true);

      await changeLanguage(code);

      if (user) {
        await axiosInstance.patch("/user/language", { language: code });
        setUser({ ...user, language: code });
      }

      notify.success("Language changed successfully.");

      setLanguageDialogOpen(false);
    } catch (err) {
      console.error(err);
      notify.error("Failed to change language.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          handleOpenAuthentication();
        }}
        className="cursor-pointer"
      >
        <Languages className="mr-2 h-4 w-4" />
        Language
      </DropdownMenuItem>

      <AuthenticationDialog flow={auth} />

      <LanguageSelectionDialog
        open={languageDialogOpen}
        currentLanguage={language as LanguageCode}
        loading={saving}
        onClose={() => setLanguageDialogOpen(false)}
        onApply={handleApplyLanguage}
      />
    </>
  );
}
