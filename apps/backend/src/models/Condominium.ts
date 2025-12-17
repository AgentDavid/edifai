import mongoose, { Schema, Document, Types } from "mongoose";
import { Condominium } from "@repo/shared-types";

export interface ICondominium extends Condominium<Types.ObjectId>, Document {}

const CondominiumSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  admin_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reseller_id: { type: Schema.Types.ObjectId, ref: "User" },
  settings: {
    calculation_method: {
      type: String,
      enum: ["m2", "equitativo"],
      required: true,
    },
    currency: { type: String, default: "USD" },
    notifications: {
      enabled: { type: Boolean, default: true },
      whatsapp_provider: { type: String },
      whatsapp_instance_id: { type: String },
      ai_chatbot_enabled: { type: Boolean, default: false },
    },
    communication_channels: {
      whatsapp_enabled: { type: Boolean, default: false },
      email_enabled: { type: Boolean, default: true },
    },
    ai_config: {
      base_prompt: {
        type: String,
        default: "You are a helpful assistant for this condominium.",
      },
      knowledge_base: { type: String, default: "" },
    },
  },
  amenities: [{ type: String }],
});

export default mongoose.model<ICondominium>("Condominium", CondominiumSchema);
