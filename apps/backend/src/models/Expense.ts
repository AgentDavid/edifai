import mongoose, { Schema, Document, Types } from "mongoose";
import { Expense } from "@repo/shared-types";

export interface IExpense extends Expense<Types.ObjectId>, Document {}

const ExpenseSchema: Schema = new Schema({
  condominium_id: {
    type: Schema.Types.ObjectId,
    ref: "Condominium",
    required: true,
  },
  type: {
    type: String,
    enum: ["FIXED", "VARIABLE", "RESERVE"],
    required: true,
  },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  invoice_url: { type: String },
  status: { type: String, enum: ["active", "voided"], default: "active" },
});

export default mongoose.model<IExpense>("Expense", ExpenseSchema);
