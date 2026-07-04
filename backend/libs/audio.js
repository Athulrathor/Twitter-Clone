import User from "../models/user.js";
import { createOtp } from "../libs/otp.js";
import { sendOtpEmail } from "../libs/email.js";

export const requestAudioOtp = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const otp = await createOtp({
      firebaseUid: user.firebaseUid,
      email: user.email,
      purpose: "AUDIO_UPLOAD",
    });

    await sendOtpEmail(
      user.email,
      user.username,
      otp.otp,
      otp.expiresAt
    );

    return res.status(200).json({
      success: true,
      expiresAt: otp.expiresAt,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP.",
    });
  }
};

export const verifyAudioOtp = async (req, res) => {
  try {
    const { otp,firebaseUid } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    await verifyOtp({
      firebaseUid,
      otp,
      purpose: "AUDIO_UPLOAD",
    });

    return res.status(200).json({
      success: true,
      message: "Audio upload authorized.",
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};