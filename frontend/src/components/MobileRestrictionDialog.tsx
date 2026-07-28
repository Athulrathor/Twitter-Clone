"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Trash2,
} from "lucide-react";

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

export type ActionDialogVariant =
  | "success"
  | "warning"
  | "danger"
  | "info";

interface ActionButton {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface ActionDialogProps {
  open: boolean;

  variant?: ActionDialogVariant;

  title: string;

  description?: string;

  icon?: React.ReactNode;

  primaryAction: ActionButton;

  secondaryAction?: ActionButton;

  preventClose?: boolean;

  showCloseButton?: boolean;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    iconClass:
      "bg-green-500/10 text-green-500",
    primaryButton:
      "bg-green-600 hover:bg-green-700",
  },

  warning: {
    icon: ShieldAlert,
    iconClass:
      "bg-yellow-500/10 text-yellow-500",
    primaryButton:
      "bg-yellow-600 hover:bg-yellow-700",
  },

  danger: {
    icon: Trash2,
    iconClass:
      "bg-red-500/10 text-red-500",
    primaryButton:
      "bg-red-600 hover:bg-red-700",
  },

  info: {
    icon: Info,
    iconClass:
      "bg-blue-500/10 text-blue-500",
    primaryButton:
      "bg-blue-600 hover:bg-blue-700",
  },
};

export default function ActionDialog({
  open,
  variant = "info",
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  preventClose = false,
  showCloseButton = false,
}: ActionDialogProps) {
  const config = variantConfig[variant];

  const Icon = config.icon;

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(value) => {
        if (!preventClose && !value) {
          secondaryAction?.onClick();
        }
      }}
    >
      <DialogContent
        showCloseButton={showCloseButton}
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="items-center text-center space-y-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              config.iconClass
            )}
          >
            {icon ?? <Icon className="h-8 w-8" />}
          </div>

          <DialogTitle>
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className={cn(
              "w-full",
              config.primaryButton
            )}
            disabled={
              primaryAction.loading ||
              primaryAction.disabled
            }
            onClick={primaryAction.onClick}
          >
            {primaryAction.loading
              ? "Please wait..."
              : primaryAction.label}
          </Button>

          {secondaryAction && (
            <Button
              variant="outline"
              className="w-full"
              disabled={
                secondaryAction.loading ||
                secondaryAction.disabled
              }
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}