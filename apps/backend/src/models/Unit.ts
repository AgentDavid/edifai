import mongoose, { Schema, Document, Types } from "mongoose";
import { Unit } from "@repo/shared-types";

export interface IUnit extends Unit<Types.ObjectId>, Document {}

const UnitSchema: Schema = new Schema({
  condominium_id: {
    type: Schema.Types.ObjectId,
    ref: "Condominium",
    required: true,
  },
  unit_number: { type: String, required: true },
  owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  specs: {
    area_m2: { type: Number, required: true },
    aliquot_percentage: { type: Number, required: true },
  },
  current_balance: { type: Number, default: 0.0 },
});

export default mongoose.model<IUnit>("Unit", UnitSchema);
