import axiosInstance from "@/lib/axiosInstance";
import { auth } from "@/context/firebase";

async function getToken() {
  return await auth.currentUser?.getIdToken();
}

export async function requestAudioOtp(
  firebaseUid: string,
  email: string
) {
  const token = await getToken();

  return axiosInstance.post(
    "/login/otp",
    {
      firebaseUid,
      email,
      purpose: "AUDIO_UPLOAD",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function verifyAudioOtp(
  firebaseUid: string,
  otp: string
) {
  const token = await getToken();

  return axiosInstance.post(
    "/login/verify",
    {
      firebaseUid,
      otp,
      purpose: "AUDIO_UPLOAD",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function uploadAudio(file: File) {
  const token = await getToken();

  const formData = new FormData();
  formData.append("audio", file);

  return axiosInstance.post("/upload/audio", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteAudio(publicId: string) {
  const token = await getToken();

  return axiosInstance.delete(`/delete/${publicId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}