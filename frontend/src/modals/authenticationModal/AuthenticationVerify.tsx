import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthentication from "./useAuthenticationHook";

interface Props {
  flow: ReturnType<typeof useAuthentication>;
}

export default function AuthenticationVerify({ flow }: Props) {
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

        {flow.error && (
          <p className="text-sm text-destructive">
            {flow.error}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={flow.otp.length !== 6}
          onClick={flow.verify}
        >
          {flow.request?.confirmText ?? "Verify"}
        </Button>

        <Button
          variant="outline"
          className="flex-1"
          onClick={flow.cancel}
        >
          {flow.request?.cancelText ?? "Cancel"}
        </Button>
      </div>
    </div>
  );
}