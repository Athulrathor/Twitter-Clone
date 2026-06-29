import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firebaseUid: {
      type: String,
      required: true,
    },

    ipAddress: {
      type: String,
      required: true,
    },

    browser: {
      type: String,
      required: true,
    },

    os: {
      type: String,
      required: true,
    },

    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "tablet", "unknown"],
      default: "unknown",
    },

    loginTime: {
      type: Date,
      default: Date.now,
    },

    logoutTime: {
      type: Date,
    },

    location: {
      country: String,
      region: String,
      city: String,
      latitude: String,
      longitude: String,
      timezone: String,
    },

    loginMethod: {
      type: String,
      enum: ["google", "email"],
      required: true,
    },

    // Whether OTP was completed
    otpVerified: {
      type: Boolean,
      default: false,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    userAgent: {
      type: String,
    },

    deviceName: {
      type: String,
      default: "",
    },

    expiresAt: {
      type: Date,
      index: {
        expires: 0,
      },
    },

    otpVerifiedAt: Date,

    status: {
      type: String,
      enum: ["pending", "active", "logged_out", "failed", "blocked", "expired"],
      default: "pending",
    },

    blockedAt: Date,

    isCurrent: {
      type: Boolean,
      default: false,
    },

    blockedReason: String,
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ firebaseUid: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ lastActiveAt: -1 });

export default mongoose.model("Session", sessionSchema);
