import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password_hash: string;
  role: "super_admin" | "reseller" | "admin_condominio" | "usuario_condominio";
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  preferences: {
    notifications_channel: "WHATSAPP" | "EMAIL" | "BOTH";
  };
  status: "active" | "inactive" | "blocked";
  created_at: Date;
}

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
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
