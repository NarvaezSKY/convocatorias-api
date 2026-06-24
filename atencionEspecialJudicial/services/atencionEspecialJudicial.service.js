import { AtencionEspecialJudicial } from "../../models/AtencionEspecialJudicial.js";
import {
  addCaseToSheet,
  updateCaseInSheet,
  deleteCaseFromSheet,
} from "../sheets/googleSheets.service.js";

const VALID_ESTADOS = ["Por atender", "En atención", "Atendido"];

const validateMunicipios = (municipios) => {
  const errors = [];

  if (!Array.isArray(municipios) || municipios.length === 0) {
    errors.push("municipios must be a non-empty array");
    return errors;
  }

  const seen = new Set();

  for (let i = 0; i < municipios.length; i++) {
    const item = municipios[i];

    if (!item.municipio || !item.municipio.trim()) {
      errors.push(`municipios[${i}].municipio is required`);
    }

    if (!item.aso_org_terri || !item.aso_org_terri.trim()) {
      errors.push(`municipios[${i}].aso_org_terri is required`);
    }

    const key = item.municipio?.trim().toLowerCase();
    if (key) {
      if (seen.has(key)) {
        errors.push(`Municipio duplicado: ${item.municipio}`);
      }
      seen.add(key);
    }
  }

  return errors;
};

const validateCreateData = async (data) => {
  const errors = [];

  if (!data.caso_o_sentencia || !data.caso_o_sentencia.trim()) {
    errors.push("caso_o_sentencia is required");
  } else {
    const existing = await AtencionEspecialJudicial.findOne({ caso_o_sentencia: data.caso_o_sentencia.trim() });
    if (existing) errors.push("Ya existe un registro con ese caso_o_sentencia");
  }

  errors.push(...validateMunicipios(data.municipios));

  if (!data.fecha_expedicion_requerimiento) {
    errors.push("fecha_expedicion_requerimiento is required");
  }

  if (!data.fecha_limite_requerimiento) {
    errors.push("fecha_limite_requerimiento is required");
  }

  if (data.fecha_expedicion_requerimiento && data.fecha_limite_requerimiento) {
    const exp = new Date(data.fecha_expedicion_requerimiento);
    const lim = new Date(data.fecha_limite_requerimiento);
    if (isNaN(exp.getTime())) errors.push("fecha_expedicion_requerimiento is not a valid date");
    if (isNaN(lim.getTime())) errors.push("fecha_limite_requerimiento is not a valid date");
    if (!isNaN(exp.getTime()) && !isNaN(lim.getTime()) && exp >= lim) {
      errors.push("fecha_expedicion_requerimiento debe ser anterior a fecha_limite_requerimiento");
    }
  }

  if (!data.case_estado) {
    errors.push("case_estado is required");
  } else if (!VALID_ESTADOS.includes(data.case_estado)) {
    errors.push(`case_estado debe ser uno de: ${VALID_ESTADOS.join(", ")}`);
  }

  if (!data.case_acciones || !data.case_acciones.trim()) {
    errors.push("case_acciones is required");
  }

  return errors;
};

const validateUpdateData = async (id, data) => {
  const errors = [];

  if (data.caso_o_sentencia !== undefined) {
    const trimmed = data.caso_o_sentencia.trim();
    if (!trimmed) {
      errors.push("caso_o_sentencia cannot be empty");
    } else {
      const existing = await AtencionEspecialJudicial.findOne({ caso_o_sentencia: trimmed, _id: { $ne: id } });
      if (existing) errors.push("Ya existe otro registro con ese caso_o_sentencia");
    }
  }

  if (data.municipios !== undefined) {
    errors.push(...validateMunicipios(data.municipios));
  }

  if (data.case_estado !== undefined && !VALID_ESTADOS.includes(data.case_estado)) {
    errors.push(`case_estado debe ser uno de: ${VALID_ESTADOS.join(", ")}`);
  }

  if (data.fecha_expedicion_requerimiento !== undefined && data.fecha_limite_requerimiento !== undefined) {
    const exp = new Date(data.fecha_expedicion_requerimiento);
    const lim = new Date(data.fecha_limite_requerimiento);
    if (!isNaN(exp.getTime()) && !isNaN(lim.getTime()) && exp >= lim) {
      errors.push("fecha_expedicion_requerimiento debe ser anterior a fecha_limite_requerimiento");
    }
  }

  if (data.fecha_expedicion_requerimiento !== undefined) {
    const d = new Date(data.fecha_expedicion_requerimiento);
    if (isNaN(d.getTime())) errors.push("fecha_expedicion_requerimiento is not a valid date");
  }

  if (data.fecha_limite_requerimiento !== undefined) {
    const d = new Date(data.fecha_limite_requerimiento);
    if (isNaN(d.getTime())) errors.push("fecha_limite_requerimiento is not a valid date");
  }

  return errors;
};

export const getAllCases = async () => {
  return await AtencionEspecialJudicial.find();
};

export const getCaseById = async (id) => {
  const caseItem = await AtencionEspecialJudicial.findById(id);
  if (!caseItem) throw new Error("Case not found");
  return caseItem;
};

export const createCase = async (data) => {
  const errors = await validateCreateData(data);
  if (errors.length > 0) throw new Error(errors.join(" | "));

  const newCase = new AtencionEspecialJudicial(data);
  const result = await newCase.save();
  await addCaseToSheet(result);
  return result;
};

export const updateCase = async (id, data) => {
  const caseItem = await AtencionEspecialJudicial.findById(id);
  if (!caseItem) throw new Error("Case not found");

  const errors = await validateUpdateData(id, data);
  if (errors.length > 0) throw new Error(errors.join(" | "));

  Object.assign(caseItem, data);
  const result = await caseItem.save();
  await updateCaseInSheet(result);
  return result;
};

export const deleteCase = async (id) => {
  const caseItem = await AtencionEspecialJudicial.findById(id);
  if (!caseItem) throw new Error("Case not found");
  await caseItem.deleteOne();
  await deleteCaseFromSheet(id);
  return { message: "Case deleted" };
};

export const filterCases = async (filters) => {
  const query = {};

  for (const key in filters) {
    const value = filters[key];
    if (!value) continue;

    if (key === "case_estado") {
      query.case_estado = value;
      continue;
    }

    if (key === "fecha_expedicion_requerimiento" || key === "fecha_limite_requerimiento") {
      query[key] = new Date(value);
      continue;
    }

    if (key === "municipio" || key === "aso_org_terri") {
      query[`municipios.${key}`] = { $regex: value, $options: "i" };
      continue;
    }

    query[key] = { $regex: value, $options: "i" };
  }

  return await AtencionEspecialJudicial.find(query);
};
