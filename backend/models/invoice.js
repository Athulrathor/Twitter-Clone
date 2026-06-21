import mongoose from "mongoose";

const InvoiceSchema = mongoose.Schema({
  name: { type: String},
  paymentId: { type: String, required: true },
  pdfUrl: { type: String },
  invoiceNumber: { type: String, default: 0 },
});

export default mongoose.model("Invoice", InvoiceSchema);
