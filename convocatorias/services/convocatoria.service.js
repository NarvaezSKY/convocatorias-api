import ExcelJS from "exceljs";
import mongoose from "mongoose";
import { Convocatoria } from "../../models/Convocatoria.js";
import { PlanFinanciero } from "../../models/PlanFinanciero.js";
import {
  addConvocatoriaToSheet,
  updateConvocatoriaInSheet,
  deleteConvocatoriaFromSheet,
} from "../sheets/googleSheets.service.js";

const parseBeneficiariosNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeBeneficiariosPorMunicipio = (beneficiariosPorMunicipio) => {
  if (!Array.isArray(beneficiariosPorMunicipio)) {
    throw new Error("beneficiariosPorMunicipio must be an array");
  }

  return beneficiariosPorMunicipio.map((item) => {
    const municipio = (item?.municipio || "").trim();
    const directos = parseBeneficiariosNumber(item?.directos);
    const indirectos = parseBeneficiariosNumber(item?.indirectos);

    if (!municipio) {
      throw new Error("Each beneficiariosPorMunicipio item must include municipio");
    }

    if (directos < 0 || indirectos < 0) {
      throw new Error("Beneficiary values cannot be negative");
    }

    return {
      municipio,
      directos,
      indirectos,
    };
  });
};

const validateBeneficiariosPorMunicipio = (beneficiariosPorMunicipio, municipiosDeImpacto) => {
  if (!Array.isArray(beneficiariosPorMunicipio) || beneficiariosPorMunicipio.length === 0) {
    return;
  }

  const seenMunicipios = new Set();
  for (const item of beneficiariosPorMunicipio) {
    const normalizedMunicipio = item.municipio.trim().toLowerCase();
    if (seenMunicipios.has(normalizedMunicipio)) {
      throw new Error(`Municipio duplicado en beneficiariosPorMunicipio: ${item.municipio}`);
    }
    seenMunicipios.add(normalizedMunicipio);
  }

  if (Array.isArray(municipiosDeImpacto) && municipiosDeImpacto.length > 0) {
    const municipiosPermitidos = new Set(
      municipiosDeImpacto.map((municipio) => String(municipio).trim().toLowerCase())
    );

    for (const item of beneficiariosPorMunicipio) {
      const municipio = item.municipio.trim().toLowerCase();
      if (!municipiosPermitidos.has(municipio)) {
        throw new Error(
          `El municipio ${item.municipio} no existe en municipiosDeImpacto`
        );
      }
    }
  }
};

const calculateBeneficiariosTotals = (beneficiariosPorMunicipio) => {
  return beneficiariosPorMunicipio.reduce(
    (acc, item) => {
      acc.directos += parseBeneficiariosNumber(item.directos);
      acc.indirectos += parseBeneficiariosNumber(item.indirectos);
      return acc;
    },
    { directos: 0, indirectos: 0 }
  );
};

export const getAllConvocatorias = async () => {
  return await Convocatoria.find().populate("user_id");
};

export const createConvocatoria = async (data, userId) => {
  const valorSolicitado = parseFloat(data.valor_solicitado) || 0;
  const valorAprobado = parseFloat(data.valor_aprobado) || 0;
  const diferenciaPresupuesto = valorSolicitado - valorAprobado;
  const payload = { ...data };

  if (payload.beneficiariosPorMunicipio !== undefined) {
    const beneficiariosPorMunicipio = normalizeBeneficiariosPorMunicipio(
      payload.beneficiariosPorMunicipio
    );
    validateBeneficiariosPorMunicipio(beneficiariosPorMunicipio, payload.municipiosDeImpacto);
    const totals = calculateBeneficiariosTotals(beneficiariosPorMunicipio);

    payload.beneficiariosPorMunicipio = beneficiariosPorMunicipio;
    payload.numeroBeneficiariosDirectos = totals.directos;
    payload.numeroBeneficiariosIndirectos = totals.indirectos;
  }

  // Si no se proporciona el año, usar el año actual
  const year = data.year || new Date().getFullYear();

  const nuevaConvocatoria = new Convocatoria({
    ...payload,
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

  if (data.beneficiariosPorMunicipio !== undefined) {
    const beneficiariosPorMunicipio = normalizeBeneficiariosPorMunicipio(
      convocatoria.beneficiariosPorMunicipio
    );
    validateBeneficiariosPorMunicipio(
      beneficiariosPorMunicipio,
      convocatoria.municipiosDeImpacto
    );
    const totals = calculateBeneficiariosTotals(beneficiariosPorMunicipio);

    convocatoria.beneficiariosPorMunicipio = beneficiariosPorMunicipio;
    convocatoria.numeroBeneficiariosDirectos = totals.directos;
    convocatoria.numeroBeneficiariosIndirectos = totals.indirectos;
  } else if (
    data.municipiosDeImpacto !== undefined &&
    Array.isArray(convocatoria.beneficiariosPorMunicipio) &&
    convocatoria.beneficiariosPorMunicipio.length > 0
  ) {
    validateBeneficiariosPorMunicipio(
      convocatoria.beneficiariosPorMunicipio,
      convocatoria.municipiosDeImpacto
    );
  }

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

    // Campos de arrays de población objetivo
    if (key === 'departamentosDeImpacto' || key === 'municipiosDeImpacto' || key === 'tiposPoblacionesAtendidas' || key === 'programasRelacionados') {
      // Dividir por comas y limpiar espacios
      const valores = value.split(',').map(v => v.trim()).filter(v => v);
      if (valores.length > 0) {
        // Buscar que el array contenga al menos uno de los valores
        query[key] = { $in: valores };
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
