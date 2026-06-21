import mongoose from "mongoose";

const PaymentSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  amount: { type: Number, required: true },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  invoiceNumber: { type: String, default: 0 },
  invoiceUrl: { type: String },
});

export default mongoose.model("Payment", PaymentSchema);
