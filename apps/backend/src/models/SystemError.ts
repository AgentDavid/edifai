import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISystemError extends Document {
  message: string;
  stack?: string;
  path?: string;
  method?: string;
  status: "OPEN" | "ATTENDED";
  attended_by?: Types.ObjectId;
  attended_at?: Date;
  created_at: Date;
}

const SystemErrorSchema: Schema = new Schema({
  message: { type: String, required: true },
  stack: { type: String },
  path: { type: String },
  method: { type: String },
  status: {
    type: String,
    enum: ["OPEN", "ATTENDED"],
    default: "OPEN",
  },
  attended_by: { type: Schema.Types.ObjectId, ref: "User" },
  attended_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<ISystemError>("SystemError", SystemErrorSchema);
