import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    ref: "User",
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  otpHashed: {
    type: String,
    required: true,
  },

  attempts: {
    type: Number,
    default: 0,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);
