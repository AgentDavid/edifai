import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUnit extends Document {
  condominium_id: Types.ObjectId;
  unit_number: string;
  owner_id: Types.ObjectId;
  specs: {
    area_m2: number;
    aliquot_percentage: number;
  };
  current_balance: number;
}

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
