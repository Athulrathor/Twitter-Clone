import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VerifyEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VerifyEmailDialog: React.FC<VerifyEmailDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [step, setStep] = useState<"intro" | "otp" | "success">("intro");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Email</DialogTitle>
          <DialogDescription>
            Please verify your email address to continue.
          </DialogDescription>
        </DialogHeader>

        {step === "intro" && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              We sent a verification code to your email. Enter it below to verify your account.
            </p>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4 py-4">
            <label className="block text-sm font-medium">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        )}

        {step === "success" && (
          <div className="py-4">
            <p className="text-sm text-green-600">
              Your email has been verified successfully.
            </p>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
            disabled={loading}
            onClick={() => {
              if (step === "intro") setStep("otp");
              else if (step === "otp") setStep("success");
            }}
          >
            {loading ? "Loading..." : step === "otp" ? "Verify" : "Continue"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyEmailDialog;
