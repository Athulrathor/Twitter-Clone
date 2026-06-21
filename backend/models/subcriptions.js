import mongoose from "mongoose";

const SubscriptionsSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  startDate: { type: Number, required: true },
  endDate: { type: String, required: true },
  isActive: { type: [String], default: [] },
});

export default mongoose.model("Subscription", SubscriptionsSchema);
