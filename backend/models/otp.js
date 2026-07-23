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

  phoneSecret: {
    type: String,
    default: null,
    
  },
  
  purpose: {
    type: String,
    enum: [ "VERIFY_EMAIL", "AUDIO_UPLOAD","CHANGE_LANGUAGE"],
    required: true,
  },
},{timestamps: true});

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);
