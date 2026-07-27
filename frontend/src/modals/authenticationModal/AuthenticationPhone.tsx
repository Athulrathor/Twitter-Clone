"use client";

import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import useAuthentication, { AuthenticationPurpose } from "./useAuthenticationHook";

interface Props {
  flow: ReturnType<typeof useAuthentication>;
}

export default function AuthenticationPhone({ flow }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
          <Phone className="h-6 w-6 text-blue-500" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Enter your phone number to receive an SMS verification code.
        </p>
      </div>

      <Input
        type="tel"
        placeholder="+91 9876543210"
        value={flow.phoneNumber}
        onChange={(e) => flow.setPhoneNumber(e.target.value)}
      />

      {!!flow.error && <p className="text-sm text-red-500">{flow.error}</p>}

      <Button
        className="w-full"
        disabled={!flow.phoneNumber.trim()}
        onClick={flow.sendPhoneOtp}
      >
        Send OTP
      </Button>

      {flow.request?.purpose !== AuthenticationPurpose.PHONE_VERIFICATION && (
        <Button
          variant="outline"
          className="w-full"
          onClick={flow.cancel}
          disabled={flow.state === "phone"}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
