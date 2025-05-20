import mongoose from 'mongoose';

const convocatoriaSchema = new mongoose.Schema({
  convocatoria: { type: String, required: true },
  consecutivo: { type: String, maxlength: 50 },
  direccion_oficina_regional: { type: String, maxlength: 200 },
  tipo_postulacion: { type: String, maxlength: 50 },
  nuevo_estado: { type: String, maxlength: 50 },
  nombre: { type: String, maxlength: 800 },
  fecha_aprobacion: { type: String },
  fecha_inicio: { type: String },
  fecha_fin: { type: String },
  observaciones: { type: String, maxlength: 5000 },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: { type: String, maxlength: 500 },
  valor_solicitado: { type: Number },
  valor_aprobado: { type: Number },
  diferencia_presupuesto: { type: Number },
}, { timestamps: false });

export const Convocatoria = mongoose.model('Convocatoria', convocatoriaSchema);
