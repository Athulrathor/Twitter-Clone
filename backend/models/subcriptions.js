import mongoose from "mongoose";

const SubscriptionsSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean , default: false },
});

export default mongoose.model("Subscription", SubscriptionsSchema);
