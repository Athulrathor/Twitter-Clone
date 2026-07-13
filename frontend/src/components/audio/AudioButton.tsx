import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { requestAudioOtp } from "./service/audio.service";
import { useAuth } from "@/context/AuthContext";

interface AudioButtonProps {
  // onFileSelected: (file: File) => void;
  canSend: boolean;
  onOtpRequested: () => void;
}

const MAX_SIZE = 100 * 1024 * 1024; //100MB

export default function AudioButton({
  canSend,
  onOtpRequested,
}: AudioButtonProps) {

  const { user,firebaseUid } = useAuth();

  const handleRequestOtp = async () => {
    if (!firebaseUid || !user) return;
    try {
        await requestAudioOtp(firebaseUid, user.email);

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
        onClick={handleRequestOtp}
      >
        <Music2 className="h-5 w-5 text-blue-400" />
      </Button>
    </>
  );
}