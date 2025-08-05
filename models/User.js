import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, maxlength: 50 },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "investigador",
        "dinamizador",
        "admin",
        "superadmin",
        "Linvestigador",
        "aprendiz"
      ],
      default: "investigador",
    },
    telefono: { type: String, maxlength: 15, default: "" },
    estado: { type: String, enum: ["activo", "inactivo"], default: "inactivo" },

    //Dinamizador - Investigador fields
    areaDeTrabajo: { type: String, maxlength: 200, default: "" },
    clasificacionMinCiencias: { type: String, maxlength: 200, default: "" },
    CvLAC: { type: String, maxlength: 200, default: "" },
    SemilleroInvestigacion: { type: String, maxlength: 200, default: "" },
    enlaceDeProductos: { type: String, maxlength: 200, default: "" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
