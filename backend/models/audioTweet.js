import mongoose from "mongoose";

const AudioSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tweetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
      default: null,
    },
    audioUrl: {
      type: String,
      required: true,
    },

    storagePath: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Audio", AudioSchema);
