import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import AuthenticationDialog from "@/modals/authenticationModal/AuthenticationDialogCard";
import useAuthentication, { AuthenticationPurpose } from "@/modals/authenticationModal/useAuthenticationHook";
import { useEffect } from "react";

export default function PhoneVerificationGuard() {
  const { user, firebaseUid } = useAuth();
  const phoneAuth = useAuthentication();

  useEffect(() => {
    if (!user || !firebaseUid) return;

    if (!user.phoneNumber) {
      phoneAuth.start({
        purpose: AuthenticationPurpose.PHONE_VERIFICATION,
        title: "Add Phone Number",
        description: "Add your phone number to secure your account.",

        onSendOtp: async (payload: { phoneNumber?: string }) => {
          await requestPhoneOtp({
            firebaseUid,
            phoneNumber: payload?.phoneNumber,
          });
        },

        onVerifyOtp: async (otp, payload: { phoneNumber?: string }) => {
          const res = await verifyPhoneOtp({
            firebaseUid,
            otp,
            phoneNumber: payload?.phoneNumber,
          });

          return res.data.success;
        },

        onVerified: async (payload?: {phoneNumber: string;}) => {
          await axiosInstance.patch("/user/phone", {
            phoneNumber: (payload as { phoneNumber?: string })?.phoneNumber,
          });
        },
      });
    }
  }, [user, firebaseUid]);

  return <AuthenticationDialog flow={phoneAuth} />;
}
