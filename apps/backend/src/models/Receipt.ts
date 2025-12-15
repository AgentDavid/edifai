import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReceipt extends Document {
  unit_id: Types.ObjectId;
  condominium_id: Types.ObjectId;
  billing_period: string;
  total_amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  breakdown: {
    description: string;
    amount: number;
  }[];
  issued_date: Date;
  due_date: Date;
}

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
