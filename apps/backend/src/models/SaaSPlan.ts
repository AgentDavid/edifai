import mongoose, { Schema, Document, Types } from "mongoose";
import { SaaSPlan } from "@repo/shared-types";

export interface ISaaSPlan extends SaaSPlan<Types.ObjectId>, Document {}

const SaaSPlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  max_units: { type: Number, required: true },
  monthly_price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  features: [{ type: String }],
  ai_features_enabled: { type: Boolean, default: false },
});

export default mongoose.model<ISaaSPlan>("SaaSPlan", SaaSPlanSchema);
