import ExcelJS from "exceljs";
import mongoose from "mongoose";
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

export const createConvocatoria = async (data, userId) => {
  const valorSolicitado = parseFloat(data.valor_solicitado) || 0;
  const valorAprobado = parseFloat(data.valor_aprobado) || 0;
  const diferenciaPresupuesto = valorSolicitado - valorAprobado;

  // Si no se proporciona el año, usar el año actual
  const year = data.year || new Date().getFullYear();

  const nuevaConvocatoria = new Convocatoria({
    ...data,
    user_id: userId,
    diferencia_presupuesto: diferenciaPresupuesto,
    year: year,
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

  // Si se proporciona el año en los datos, actualizarlo
  if (data.year) {
    convocatoria.year = data.year;
  }

  await updateConvocatoriaInSheet(convocatoria);

  return await convocatoria.save();
};

export const deleteConvocatoria = async (id) => {
  const convocatoria = await Convocatoria.findById(id);
  if (!convocatoria) throw new Error("Convocatoria not found");

  const planFinanciero = await PlanFinanciero.findOne({ convocatoria: id });
  if (planFinanciero) await PlanFinanciero.deleteOne({ convocatoria: id });

  await convocatoria.deleteOne();
  await deleteConvocatoriaFromSheet(id);
  return { message: "Convocatoria deleted" };
};

export const filterConvocatorias = async (filters) => {
  const query = {};

  // Normalizar claves provenientes de querystring (users[] vs users)
  const normalized = { ...filters };
  if (normalized['users[]'] && !normalized.users) {
    normalized.users = normalized['users[]'];
  }

  for (const key in normalized) {
    const value = normalized[key];
    if (!value) continue;

    if (key === 'year') {
      query.year = parseInt(value);
      continue;
    }

    if (key === 'users') {
      // Puede venir como string único o arreglo
      const ids = Array.isArray(value) ? value : [value];
      // Filtrar ids válidos y convertirlos a ObjectId
      const objectIds = ids
        .filter(v => mongoose.Types.ObjectId.isValid(v))
        .map(v => new mongoose.Types.ObjectId(v));
      if (objectIds.length > 0) {
        query.users = { $in: objectIds }; // pertenencia en el array
      }
      continue;
    }

    // Campos de texto: búsqueda parcial insensible a mayúsculas
    query[key] = { $regex: value, $options: 'i' };
  }

  return await Convocatoria.find(query).populate('user_id');
};

export const generateConvocatoriasReport = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Convocatorias");
  const excludedKeys = ["_id", "user_id", "__v"];

  if (data.length === 0) {
    worksheet.addRow(["No data available"]);
  } else {
    const columns = Object.keys(data[0]._doc)
      .filter((key) => !excludedKeys.includes(key))
      .map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));
    worksheet.columns = columns;

    data.forEach((row) => {
      const cleanRow = {};
      for (const key in row._doc) {
        if (!excludedKeys.includes(key)) {
          cleanRow[key] = row._doc[key];
        }
      }
      worksheet.addRow(cleanRow);
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

// Nueva función para obtener convocatorias por año
export const getConvocatoriasByYear = async (year) => {
  return await Convocatoria.find({ year: parseInt(year) }).populate("user_id");
};

// Nueva función para obtener todos los años disponibles
export const getAvailableYears = async () => {
  const years = await Convocatoria.distinct("year");
  return years.sort((a, b) => b - a); // Ordenar de manera descendente
};

// Agregar un usuario al array `users` evitando duplicados
export const addUserToConvocatoria = async (convocatoriaId, userId) => {
  // Asegurar tipo ObjectId
  const objectUserId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : null;
  if (!objectUserId) throw new Error("Invalid userId");
  const updated = await Convocatoria.findByIdAndUpdate(
    convocatoriaId,
    { $addToSet: { users: objectUserId } },
    { new: true }
  ).populate("user_id");
  if (!updated) throw new Error("Convocatoria not found");
  await updateConvocatoriaInSheet(updated);
  return updated;
};

// Remover un usuario del array `users`
export const removeUserFromConvocatoria = async (convocatoriaId, userId) => {
  const objectUserId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : null;
  if (!objectUserId) throw new Error("Invalid userId");
  const updated = await Convocatoria.findByIdAndUpdate(
    convocatoriaId,
    { $pull: { users: objectUserId } },
    { new: true }
  ).populate("user_id");
  if (!updated) throw new Error("Convocatoria not found");
  await updateConvocatoriaInSheet(updated);
  return updated;
};

// Obtener convocatorias por id de usuario (muchos a muchos)
export const getConvocatoriasByUserId = async (userId) => {
  return await Convocatoria.find({ users: userId }).populate("user_id");
};
