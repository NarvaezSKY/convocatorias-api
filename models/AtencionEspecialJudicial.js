import mongoose from "mongoose";

const municipioSchema = new mongoose.Schema(
  {
    municipio: { type: String, required: true, maxlength: 200 },
    aso_org_terri: { type: String, required: true, maxlength: 300 },
  },
  { _id: false },
);

const atencionEspecialJudicialSchema = new mongoose.Schema(
  {
    caso_o_sentencia: { type: String, required: true, maxlength: 200 },
    municipios: {
      type: [municipioSchema],
      required: true,
      validate: (v) => v.length > 0,
    },
    fecha_expedicion_requerimiento: {
      type: Date,
      required: true,
      maxlength: 50,
    },
    fecha_limite_requerimiento: { type: Date, required: true, maxlength: 50 },
    case_estado: {
      type: String,
      required: true,
      maxlength: 50,
      enum: ["Por atender", "En atención", "Atendido"],
    },
    case_acciones: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);

export const AtencionEspecialJudicial = mongoose.model(
  "AtencionEspecialJudicial",
  atencionEspecialJudicialSchema,
);
