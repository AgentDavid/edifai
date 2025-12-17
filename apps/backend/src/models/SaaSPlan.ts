import mongoose, { Schema, Document } from "mongoose";

export interface ISaaSPlan extends Document {
  name: string;
  code: string;
  max_units: number;
  monthly_price: number;
  currency: string;
  features: string[];
}

const SaaSPlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  max_units: { type: Number, required: true },
  monthly_price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  features: [{ type: String }],
});

export default mongoose.model<ISaaSPlan>("SaaSPlan", SaaSPlanSchema);
