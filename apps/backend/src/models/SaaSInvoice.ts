import mongoose, { Schema, Document, Types } from "mongoose";
import { SaaSInvoice } from "@repo/shared-types";

export interface ISaaSInvoice extends SaaSInvoice<Types.ObjectId>, Document {}

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
