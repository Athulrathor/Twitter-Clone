import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import PasswordInput from "./PasswordInput";
import PasswordStrength from "./PasswordStrength";
import PasswordRequirements from "./PasswordRequirements";

import { useAuth } from "../../context/AuthContext";

interface Props {
  open: boolean;
  hasPassword: boolean;
  providerName?: string;
  onOpenChange: (open: boolean) => void;
}

interface Errors {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialErrors: Errors = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordDialog({
  open,
  hasPassword,
  providerName,
  onOpenChange,
}: Props) {
  const mode = hasPassword ? "change" : "message";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [errors, setErrors] = useState(initialErrors);

  const [signOutOthers, setSignOutOthers] = useState(false);

  const { changePassword,logoutOthers } = useAuth();

  function validate() {
    const nextErrors = { ...initialErrors };

    if (mode === "change" && !currentPassword.trim()) {
      nextErrors.currentPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "New password is required";
    } else {
      if (newPassword.length < 8)
        nextErrors.newPassword = "Minimum 8 characters";
      else if (!/[A-Z]/.test(newPassword))
        nextErrors.newPassword = "Add one uppercase letter";
      else if (!/[a-z]/.test(newPassword))
        nextErrors.newPassword = "Add one lowercase letter";
      else if (!/[0-9]/.test(newPassword))
        nextErrors.newPassword = "Add one number";
      else if (!/[^A-Za-z0-9]/.test(newPassword))
        nextErrors.newPassword = "Add one special character";
      else if (mode === "change" && currentPassword === newPassword)
        nextErrors.newPassword = "New password must be different";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm password";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  }

  const handleSignOutOthers = async () => {
    try {
      await logoutOthers();
      setSignOutOthers(true);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ?? "Unable to sign out other devices.",
      );
    }finally {
      setSignOutOthers(false);
    }
  }

  useEffect(() => {
    if (signOutOthers) {
      handleSignOutOthers();
    }

  }, [signOutOthers]);

  const strength = useMemo(() => {
    let score = 0;

    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    return score;
  }, [newPassword]);

  async function handleSubmit() {
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);

      await changePassword(currentPassword, newPassword);

      alert("Password updated successfully.");

      onOpenChange(false);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ?? "Unable to update password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {mode === "change" && (
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {"Change Password"}
          </DialogTitle>

          <DialogDescription>
            {"Update your account password."}
          </DialogDescription>
        </DialogHeader>
        

          <div className="space-y-5 py-4">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(v) => {
              setCurrentPassword(v);
              setErrors((p) => ({
                ...p,
                currentPassword: "",
              }));
            }}
            error={errors.currentPassword}
          />
          
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(v) => {
              setNewPassword(v);
              setErrors((p) => ({
                ...p,
                newPassword: "",
              }));
            }}
            error={errors.newPassword}
          />

          <PasswordStrength score={strength} />

          <PasswordRequirements password={newPassword} />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              setErrors((p) => ({
                ...p,
                confirmPassword: "",
              }));
            }}
            error={errors.confirmPassword}
          />

          <div className="flex items-center gap-3">
            <Checkbox
              checked={signOutOthers}
              onCheckedChange={(v) => setSignOutOthers(Boolean(v))}
            />

            <span className="text-sm">Sign out all other devices</span>
          </div>

          {serverError && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button disabled={loading} onClick={handleSubmit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

            {"Update Password"}
          </Button>
        </DialogFooter>
      </DialogContent>)} 
    </Dialog>
  );
}
