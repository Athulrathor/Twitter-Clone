import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { requestAudioOtp, verifyAudioOtp } from "./service/audio.service";
import { useAuth } from "@/context/AuthContext";
import useAuthentication, {
  AuthenticationPurpose,
} from "@/modals/authenticationModal/useAuthenticationHook";

interface AudioButtonProps {
  canSend: boolean;
  onOtpRequested: () => void;
}

const MAX_SIZE = 100 * 1024 * 1024; //100MB

export default function AudioButton({
  canSend,
  onOtpRequested,
}: AudioButtonProps) {
  const { user, firebaseUid,isInitializing } = useAuth();
  const authVerify = useAuthentication();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInitializing || !user || !firebaseUid) return;
  },[isInitializing,firebaseUid,user]);

  const handleRequestOtp = async () => {
    if (!firebaseUid || !user || !user.email) return;
    try {
      await requestAudioOtp(firebaseUid, user.email!);

      onOtpRequested();
    } catch (err) {
      console.error(err);
      alert("Unable to send OTP.");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={canSend}
        className="p-2 rounded-lg hover:bg-blue-900/20 cursor-pointer"
        onClick={() =>
          authVerify.start({
            purpose: AuthenticationPurpose.AUDIO_UPLOAD,
            onSendOtp: async () => {
              if (!firebaseUid || !user || !user.email) return;
              await requestAudioOtp(firebaseUid, user.email!);
            },
            onVerifyOtp: async (otp) => {
              await verifyAudioOtp(firebaseUid!, otp);
              return true;
            },
            onVerified: () => {
              fileInput.current?.click();
            },
          })
        }
      >
        <Music2 className="h-5 w-5 text-blue-400" />
      </Button>
    </>
  );
}
