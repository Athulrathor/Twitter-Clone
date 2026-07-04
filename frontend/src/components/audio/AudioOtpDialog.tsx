import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/context/AuthContext";

import { uploadAudio, verifyAudioOtp } from "./service/audio.service";
import { AudioUpload } from "./hook/useAudioUpload";

interface Props {
  open: boolean;
  onClose: () => void;
  onUploaded: (audio: AudioUpload) => void;
}

export default function AudioOtpDialog({ open, onClose, onUploaded }: Props) {
  const { user, firebaseUid } = useAuth();

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const verifyOtp = async () => {
    if (!firebaseUid) return;

    try {
      setLoading(true);

      await verifyAudioOtp(firebaseUid, otp);

      fileInputRef.current?.click();

    } catch (error) {
      console.log(error);
      alert("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAudioSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
) => {

    const file = e.target.files?.[0];

    if (!file) return;

    
    if (!file.type.startsWith("audio/")) {
        alert("Please select an audio file.");
        return;
    }

    if (file.size > 100 * 1024 * 1024) {
        alert("Maximum size is 100MB.");
        return;
    }

    try {
        setLoading(true);

        const res = await uploadAudio(file);

        onUploaded(res.data.audio);

        setOtp("");

        onClose();

    } catch (err) {
        console.error(err);
        alert("Audio upload failed.");
    } finally {
        setLoading(false);

        e.target.value = "";
    }
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Audio Upload</DialogTitle>
        </DialogHeader>

        <Input
          value={otp}
          maxLength={6}
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
        />
        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept="audio/*"
          onChange={handleAudioSelect}
        />
        <Button disabled={loading || otp.length !== 6} onClick={verifyOtp}>
          {loading ? "Uploading..." : "Verify"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
