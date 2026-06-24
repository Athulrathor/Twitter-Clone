import mongoose from "mongoose";

const PlanSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  features: { type: [String], default: [] },
  limit: { type: Number },
});

export default mongoose.model("Plan", PlanSchema);
