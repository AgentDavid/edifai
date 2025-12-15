import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITicket extends Document {
  condominium_id: Types.ObjectId;
  user_id: Types.ObjectId;
  type: "MAINTENANCE_REPORT" | "AMENITY_RESERVATION";
  details: {
    description?: string;
    amenity?: string;
    reservation_date?: Date;
  };
  status: "OPEN" | "APPROVED" | "REJECTED" | "COMPLETED";
  ai_interaction_log: {
    role: "user" | "bot";
    msg: string;
    timestamp?: Date;
  }[];
}

const TicketSchema: Schema = new Schema(
  {
    condominium_id: {
      type: Schema.Types.ObjectId,
      ref: "Condominium",
      required: true,
    },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["MAINTENANCE_REPORT", "AMENITY_RESERVATION"],
      required: true,
    },
    details: {
      description: { type: String },
      amenity: { type: String },
      reservation_date: { type: Date },
    },
    status: {
      type: String,
      enum: ["OPEN", "APPROVED", "REJECTED", "COMPLETED"],
      default: "OPEN",
    },
    ai_interaction_log: [
      {
        role: { type: String, enum: ["user", "bot"] },
        msg: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITicket>("Ticket", TicketSchema);
