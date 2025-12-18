import mongoose, { Schema, Document, Types } from "mongoose";
import { User } from "@repo/shared-types";

export interface IUser extends User<Types.ObjectId>, Document {}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: {
    type: String,
    enum: ["super_admin", "reseller", "admin_condominio", "usuario_condominio"],
    required: true,
  },
  profile: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  preferences: {
    notifications_channel: {
      type: String,
      enum: ["WHATSAPP", "EMAIL", "BOTH"],
      default: "EMAIL",
    },
  },
  status: {
    type: String,
    enum: ["active", "inactive", "blocked"],
    default: "active",
  },
  condominium_id: { type: Schema.Types.ObjectId, ref: "Condominium" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
