import mongoose from "mongoose";

const PasswordResetSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    tokenHash: String,
    expiresAt: {
        type: Date, default: Date.now()
    },
     used: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("PasswordReset", PasswordResetSchema);
