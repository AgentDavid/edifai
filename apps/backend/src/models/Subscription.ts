import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  condominium_id: mongoose.Types.ObjectId;
  plan_id: mongoose.Types.ObjectId;
  start_date: Date;
  next_billing_date: Date;
  status: "active" | "past_due" | "canceled";
  billing_cycle: "monthly" | "annual";
  payment_method_token?: string;
}

const SubscriptionSchema: Schema = new Schema({
  condominium_id: { type: Schema.Types.ObjectId, ref: "Condominium", required: true },
  plan_id: { type: Schema.Types.ObjectId, ref: "SaaSPlan", required: true },
  start_date: { type: Date, default: Date.now },
  next_billing_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "past_due", "canceled"],
    default: "active",
  },
  billing_cycle: {
    type: String,
    enum: ["monthly", "annual"],
    default: "monthly",
  },
  payment_method_token: { type: String },
});

export default mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
