import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICondominium extends Document {
  name: string;
  address: string;
  admin_id: Types.ObjectId;
  reseller_id?: Types.ObjectId;
  settings: {
    calculation_method: "m2" | "equitativo";
    currency: string;
    notifications: {
      enabled: boolean;
      whatsapp_provider?: string;
      whatsapp_instance_id?: string;
      ai_chatbot_enabled: boolean;
    };
    communication_channels: {
      whatsapp_enabled: boolean;
      email_enabled: boolean;
    };
    ai_config: {
      base_prompt: string;
      knowledge_base: string;
    };
  };
  amenities: string[];
}

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
