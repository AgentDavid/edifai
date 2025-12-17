import mongoose, { Schema, Document } from "mongoose";

export interface ISaaSInvoice extends Document {
  subscription_id: mongoose.Types.ObjectId;
  condominium_id: mongoose.Types.ObjectId;
  amount: number;
  issue_date: Date;
  status: "paid" | "pending";
  pdf_url?: string;
}

const SaaSInvoiceSchema: Schema = new Schema({
  subscription_id: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
  condominium_id: { type: Schema.Types.ObjectId, ref: "Condominium", required: true },
  amount: { type: Number, required: true },
  issue_date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["paid", "pending"],
    default: "pending",
  },
  pdf_url: { type: String },
});

export default mongoose.model<ISaaSInvoice>("SaaSInvoice", SaaSInvoiceSchema);
