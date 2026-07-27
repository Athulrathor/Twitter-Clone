"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import AuthenticationHeader from "./AuthenticationHeader";
import AuthenticationPhone from "./AuthenticationPhone";
import AuthenticationVerify from "./AuthenticationVerify";
import AuthenticationLoading from "./AuthenticationLoading";
import AuthenticationSuccess from "./AuthenticationSuccess";

import useAuthentication, {
  AuthenticationPurpose,
} from "./useAuthenticationHook";

interface Props {
  flow: ReturnType<typeof useAuthentication>;
}

export default function AuthenticationDialog({ flow }: Props) {
  return (
    <Dialog
      open={flow.open}
      onOpenChange={(open) => {
        if (!open) {
          if (
            flow.request?.purpose === AuthenticationPurpose.PHONE_VERIFICATION
          ) {
            return;
          }

          flow.cancel();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AuthenticationHeader
          title={flow.request?.title}
          description={flow.request?.description}
        />

        {flow.state === "phone" && <AuthenticationPhone flow={flow} />}

        {flow.state === "sending" && <AuthenticationLoading />}

        {flow.state === "otp" && <AuthenticationVerify flow={flow} />}

        {flow.state === "verifying" && <AuthenticationLoading />}

        {flow.state === "success" && <AuthenticationSuccess flow={flow} />}
      </DialogContent>
    </Dialog>
  );
}
