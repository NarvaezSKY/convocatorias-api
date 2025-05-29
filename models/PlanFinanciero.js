import mongoose from "mongoose";

const planFinancieroSchema = new mongoose.Schema(
  {
    convocatoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Convocatoria",
      required: true,
      unique: true, // Asegura que solo haya un plan por convocatoria
    },
    metadata: {
      rows: { type: Number, required: true },
      columns: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
    },
    structure: {
      rows: [{ type: String, required: true }], // Ej: ["Actividad 1", "Actividad 2"]
      columns: [{ type: String, required: true }], // Ej: ["Meses", "Mes 1", "Mes 2"]
    },
    data: {
      type: Map,
      of: {
        type: Map,
        of: String, // Permite valores como "1", "2",..."
      },
      required: true,
    },
  },
  { timestamps: true }
);

export const PlanFinanciero = mongoose.model(
  "PlanFinanciero",
  planFinancieroSchema
);
