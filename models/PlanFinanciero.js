import mongoose from "mongoose";

const planFinancieroSchema = new mongoose.Schema(
  {
    convocatoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Convocatoria",
      required: true,
      unique: true,
    },
    metadata: {
      rows: { type: Number, required: true },
      columns: { type: Number, required: true },
      totalExecutionPercentage: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
    },
    structure: {
      rows: [{ type: String, required: true }],
      columns: [{ type: String, required: true }],
    },
    data: {
      type: Object,
      of: {
        type: Object,
        of: {
          proyectado: { type: String, default: "" },
          ejecutado: { type: String, default: "" },
        },
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
