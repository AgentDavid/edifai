import mongoose, { Schema, Document, Types } from "mongoose";
import { Receipt } from "@repo/shared-types";

export interface IReceipt extends Receipt<Types.ObjectId>, Document {}

const ReceiptSchema: Schema = new Schema({
  unit_id: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
  condominium_id: {
    type: Schema.Types.ObjectId,
    ref: "Condominium",
    required: true,
  },
  billing_period: { type: String, required: true },
  total_amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "PAID", "OVERDUE"],
    default: "PENDING",
  },
  breakdown: [
    {
      description: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  issued_date: { type: Date, default: Date.now },
  due_date: { type: Date, required: true },
});

export default mongoose.model<IReceipt>("Receipt", ReceiptSchema);
