import axiosInstance from "@/lib/axiosInstance";
import { auth } from "@/context/firebase";

async function getToken() {
  return await auth.currentUser?.getIdToken();
}

interface RequestOtpPayload {
  firebaseUid: string;
  email: string;
  purpose: string;
  language?: string;
  phoneNumber?: string;
}

interface VerifyOtpPayload {
  firebaseUid: string;
  otp: string;
  purpose: string;
}

export async function requestLanguageOtp({
  firebaseUid,
 email,
  purpose,
  language,
  phoneNumber,
}: RequestOtpPayload) {
  const token = await getToken();

  return axiosInstance.post(
    "/login/otp",
    {
      firebaseUid,
      email,
      purpose,
      language,
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
  purpose
}: VerifyOtpPayload) {
  const token = await getToken();

  return axiosInstance.post(
    "/login/verify",
    {
      firebaseUid,
      otp,
      purpose,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}