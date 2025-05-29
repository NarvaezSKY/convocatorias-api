import ExcelJS from "exceljs";
import { Convocatoria } from "../../models/Convocatoria.js";
import { PlanFinanciero } from "../../models/PlanFinanciero.js";
import {
  addConvocatoriaToSheet,
  updateConvocatoriaInSheet,
  deleteConvocatoriaFromSheet,
} from "../sheets/googleSheets.service.js";

export const getAllConvocatorias = async () => {
  return await Convocatoria.find().populate("user_id");
};

// export const createConvocatoria = async (data, userId) => {
//   const valorSolicitado = parseFloat(data.valor_solicitado) || 0;
//   const valorAprobado = parseFloat(data.valor_aprobado) || 0;
//   const diferenciaPresupuesto = valorSolicitado - valorAprobado;

//   const nuevaConvocatoria = new Convocatoria({
//     ...data,
//     user_id: userId,
//     diferencia_presupuesto: diferenciaPresupuesto,
//   });

//   return await nuevaConvocatoria.save();
// };

export const createConvocatoria = async (data, userId) => {
  const valorSolicitado = parseFloat(data.valor_solicitado) || 0;
  const valorAprobado = parseFloat(data.valor_aprobado) || 0;
  const diferenciaPresupuesto = valorSolicitado - valorAprobado;

  const nuevaConvocatoria = new Convocatoria({
    ...data,
    user_id: userId,
    diferencia_presupuesto: diferenciaPresupuesto,
  });

  const result = await nuevaConvocatoria.save();
  await addConvocatoriaToSheet(result);

  return result;
};

export const updateConvocatoria = async (id, data) => {
  const convocatoria = await Convocatoria.findById(id);
  if (!convocatoria) throw new Error("Convocatoria not found");

  Object.assign(convocatoria, data);

  const valorSolicitado = parseFloat(convocatoria.valor_solicitado) || 0;
  const valorAprobado = parseFloat(convocatoria.valor_aprobado) || 0;
  convocatoria.diferencia_presupuesto = valorSolicitado - valorAprobado;

  await updateConvocatoriaInSheet(convocatoria);

  return await convocatoria.save();
};

export const deleteConvocatoria = async (id) => {
  const convocatoria = await Convocatoria.findById(id);
  if (!convocatoria) throw new Error("Convocatoria not found");

  await convocatoria.deleteOne();
  await deleteConvocatoriaFromSheet(id);
  return { message: "Convocatoria deleted" };
};

export const filterConvocatorias = async (filters) => {
  const query = {};

  for (const key in filters) {
    if (filters[key]) {
      query[key] = { $regex: filters[key], $options: "i" };
    }
  }

  return await Convocatoria.find(query).populate("user_id");
};

export const generateConvocatoriasReport = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Convocatorias");

  if (data.length === 0) {
    worksheet.addRow(["No data available"]);
  } else {
    const columns = Object.keys(data[0]._doc).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));
    worksheet.columns = columns;

    data.forEach((row) => {
      worksheet.addRow(row._doc);
    });
  }
  if (data.length === 1) {
    const convocatoria = data[0];
    const planFinanciero = await PlanFinanciero.findOne({
      convocatoria: convocatoria._id,
    });

    const planSheet = workbook.addWorksheet("Plan Financiero");

    const filas = planFinanciero.structure.rows; // ["Actividad 1", "Actividad 2", ...]
    const columnas = planFinanciero.structure.columns; // ["Meses", "Mes 1", "Mes 2", ...]
    const dataMatriz = planFinanciero.data; // Map<String, Map<String, String>>

    // Primera fila: encabezados (Meses, Mes 1, Mes 2, ...)
    planSheet.addRow(columnas);

    // Filas de datos
    filas.forEach((actividad) => {
      const fila = [actividad];
      for (let i = 1; i < columnas.length; i++) {
        const col = columnas[i];
        const valor = dataMatriz.get(actividad)?.get(col) || "";
        fila.push(valor);
      }
      planSheet.addRow(fila);
    });
  }

  return workbook;
};

export const getConvocatoriaById = async (id) => {
  const convocatoria = await Convocatoria.findById(id).populate("user_id");
  if (!convocatoria) throw new Error("Convocatoria not found");
  return convocatoria;
};
