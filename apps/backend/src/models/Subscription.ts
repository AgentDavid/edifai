import mongoose, { Schema, Document, Types } from "mongoose";
import { Subscription } from "@repo/shared-types";

export interface ISubscription extends Subscription<Types.ObjectId>, Document {}

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
