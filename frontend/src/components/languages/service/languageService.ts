import axiosInstance from "@/lib/axiosInstance";
import { auth } from "@/context/firebase";

async function getToken() {
  return await auth.currentUser?.getIdToken();
}

interface RequestOtpPayload {
  firebaseUid: string;
  email: string;
  language: string;
  phoneNumber?: string; 
}

interface VerifyOtpPayload {
  firebaseUid: string;
  otp: string;
}

export async function requestLanguageOtp({
  firebaseUid,
  email,
  language,
  phoneNumber,
}: RequestOtpPayload) {
  const token = await getToken();

  return axiosInstance.post(
    "/login/otp",
    {
      firebaseUid,
      email,
      language,
      purpose: "CHANGE_LANGUAGE",
      phoneNumber,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function verifyLanguageOtp({
  firebaseUid,
  otp,
}: VerifyOtpPayload) {
  const token = await getToken();

  return axiosInstance.post(
    "/login/verify",
    {
      firebaseUid,
      otp,
      purpose: "CHANGE_LANGUAGE",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}