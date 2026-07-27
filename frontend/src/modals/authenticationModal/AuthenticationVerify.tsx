import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthentication from "./useAuthenticationHook";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  flow: ReturnType<typeof useAuthentication>;
}

export default function AuthenticationVerify({ flow }: Props) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const expiry = Number(localStorage.getItem("phone-otp-expiry"));

    if (!expiry) return;

    const update = () => {
      const seconds = Math.max(0, Math.floor((expiry - Date.now()) / 1000));

      setRemaining(seconds);

      if (seconds <= 0) {
        localStorage.removeItem("phone-otp-expiry");
      }
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="space-y-5 py-2">
      <div className="space-y-2">
        <Input
          value={flow.otp}
          maxLength={6}
          autoFocus
          placeholder="Enter 6-digit verification code"
          onChange={(e) => flow.setOtp(e.target.value)}
        />

        {flow.error && <p className="text-sm text-destructive">{flow.error}</p>}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Resend available in <span className="font-semibold">{formatted}</span>
        </span>

        <Button variant="outline" size="sm" disabled>
          <RotateCcw className="mr-2 h-4 w-4" />
          Resend
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={flow.otp.length !== 6}
          onClick={flow.verify}
        >
          {flow.request?.confirmText ?? "Verify"}
        </Button>
      </div>
    </div>
  );
}
