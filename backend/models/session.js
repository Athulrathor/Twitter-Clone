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

      location: {
      country: String,
      region: String,
      city: String,
      latitude: String,
      longitude: String,
      timezone: String,
    },

    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);