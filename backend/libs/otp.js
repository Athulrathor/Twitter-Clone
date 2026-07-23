import bcrypt from "bcrypt";
import Otp from "../models/otp.js";
import { VerifySmsOtp } from "./sms.js";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOtp = async ({ firebaseUid, email,purpose }) => {
  await Otp.deleteMany({
    firebaseUid,
    verified: false,
    purpose,
  });

  const otp = generateOtp();

  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.create({
    firebaseUid,
    email,
    otpHashed: otpHash,
    expiresAt,
    purpose,
  });

  return {otp,expiresAt};
};

export const verifyOtp = async ({ firebaseUid, otp,purpose }) => {
  const record = await Otp.findOne({
    firebaseUid,
    verified: false,
    purpose,
  });

  if (!record) {
    throw new Error("OTP not found");
  }

  if (record.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new Error("Maximum attempts exceeded");
  }

  const matched = await bcrypt.compare(otp, record.otpHashed);

  if (!matched) {
    record.attempts += 1;
    await record.save();

    throw new Error("Invalid OTP");
  }

  if (record.phoneSecret) {
    const res = await VerifySmsOtp(record.phoneSecret,otp);

    if (!res) {
      throw new Error("Invalid OTP");
    }
    record.phoneSecret = null;
  }

  record.verified = true;

  await record.save();

  return true;
};
