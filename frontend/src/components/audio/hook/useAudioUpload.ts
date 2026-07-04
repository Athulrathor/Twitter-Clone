import { useState } from "react";

export interface AudioUpload {
  _id: string;
  audioUrl: string;
  audioPublicId: string;
  duration: number;
  size: number;
  mimeType: string;
}

export default function useAudioUpload() {
  const [audio, setAudio] = useState<AudioUpload | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [otpRequired, setOtpRequired] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [progress, setProgress] = useState(0);

  return {
    audio,
    setAudio,

    selectedFile,
    setSelectedFile,

    otpRequired,
    setOtpRequired,

    uploading,
    setUploading,

    progress,
    setProgress,
  };
}