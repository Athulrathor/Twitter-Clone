"use client";

import { useEffect, useState } from "react";
import { Check, Languages } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const LANGUAGE_OPTIONS = [
  {
    code: "en",
    label: "English",
  },
  {
    code: "hi",
    label: "हिन्दी",
  },
  {
    code: "es",
    label: "Español",
  },
  {
    code: "fr",
    label: "Français",
  },
  {
    code: "pt",
    label: "Português",
  },
  {
    code: "zh",
    label: "中文",
  },
] as const;

export type LanguageCode =
  (typeof LANGUAGE_OPTIONS)[number]["code"];

interface LanguageSelectionDialogProps {
  open: boolean;
  currentLanguage: LanguageCode;
  loading?: boolean;
  onClose: () => void;
  onApply: (
    language: LanguageCode,
  ) => Promise<void>;
}

export default function LanguageSelectionDialog({
  open,
  currentLanguage,
  loading = false,
  onClose,
  onApply,
}: LanguageSelectionDialogProps) {
  const [selected, setSelected] =
    useState<LanguageCode>(currentLanguage);

  useEffect(() => {
    if (open) {
      setSelected(currentLanguage);
    }
  }, [open, currentLanguage]);

  async function handleApply() {
    if (selected === currentLanguage) {
      onClose();
      return;
    }

    await onApply(selected);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">

        <DialogHeader>

          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Choose Language
          </DialogTitle>

          <DialogDescription>
            Select your preferred language for the application.
          </DialogDescription>

        </DialogHeader>

        <div className="space-y-2 py-2">

          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() =>
                setSelected(language.code)
              }
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                selected === language.code
                  ? "border-primary bg-primary/10"
                  : "hover:bg-muted"
              )}
            >

              <span className="font-medium">
                {language.label}
              </span>

              {selected === language.code && (
                <Check className="h-5 w-5 text-primary" />
              )}

            </button>
          ))}

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            disabled={
              loading ||
              selected === currentLanguage
            }
            onClick={handleApply}
          >
            {loading ? "Applying..." : "Apply"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}