"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import AuthenticationHeader from "./AuthenticationHeader";
import AuthenticationVerify from "./AuthenticationVerify";
import AuthenticationLoading from "./AuthenticationLoading";
import AuthenticationSuccess from "./AuthenticationSuccess";

import useAuthentication from "./useAuthenticationHook";

interface Props {
  flow: ReturnType<typeof useAuthentication>;
}

export default function AuthenticationDialog({ flow }: Props) {
  return (
    <Dialog
      open={flow.open}
      onOpenChange={(open) => {
        if (!open) flow.cancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <AuthenticationHeader
          title={flow.request?.title}
          description={flow.request?.description}
        />

        {flow.state === "sending" && <AuthenticationLoading />}

        {flow.state === "otp" && <AuthenticationVerify flow={flow} />}

        {flow.state === "verifying" && <AuthenticationLoading />}

        {flow.state === "success" && <AuthenticationSuccess flow={flow} />}
      </DialogContent>
    </Dialog>
  );
}

//   auth.start({
//     action: "language",
//     title: "Change Language",
//     description: "Verify before changing language.",
//     confirmText: "Continue",
//     onVerified: () => {
//       setLanguageDialog(true);
//     },
//   });

// auth.start({
//   action: "verify-email",
//   title: "Verify Email",
//   description: "Verify your email address.",
//   onVerified: async () => {
//     await sendVerificationCode();
//   },
// });

// auth.start({
//   action: "audio-upload",
//   title: "Upload Audio",
//   description: "Verify before uploading audio.",
//   onVerified: () => {
//     fileInputRef.current?.click();
//   },
// });
