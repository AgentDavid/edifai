import mongoose, { Schema, Document, Types } from "mongoose";

export interface IExpense extends Document {
  condominium_id: Types.ObjectId;
  type: "FIXED" | "VARIABLE" | "RESERVE";
  category: string;
  description: string;
  amount: number;
  date: Date;
  invoice_url?: string;
  status: "active" | "voided";
}

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
