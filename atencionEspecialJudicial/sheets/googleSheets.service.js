import { googleSheetsClient } from '../../libs/google/googleSheetsAPIClient.plugin.js';
import { SPREAD_SHEET_ID } from '../../config/token.js';

const CASE_SHEET_NAME = process.env.SHEET_NAME_CASES || 'Cases';

const CASE_HEADERS = [
  'id',
  'caso_o_sentencia',
  'municipio',
  'aso_org_terri',
  'fecha_expedicion_requerimiento',
  'fecha_limite_requerimiento',
  'case_estado',
  'case_acciones',
  'created_at',
  'updated_at',
];

const getSheetIdByName = async (sheetName) => {
  const res = await googleSheetsClient.spreadsheets.get({
    spreadsheetId: SPREAD_SHEET_ID,
  });
  const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
  return sheet?.properties.sheetId;
};

const ensureSheetExists = async (sheetName, headers = []) => {
  const existingSheetId = await getSheetIdByName(sheetName);
  if (existingSheetId !== undefined) return existingSheetId;
  const createSheetResponse = await googleSheetsClient.spreadsheets.batchUpdate({
    spreadsheetId: SPREAD_SHEET_ID,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    },
  });
  if (Array.isArray(headers) && headers.length > 0) {
    await googleSheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREAD_SHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers] },
    });
  }
  return createSheetResponse.data?.replies?.[0]?.addSheet?.properties?.sheetId;
};

const upsertHeaders = async () => {
  await googleSheetsClient.spreadsheets.values.update({
    spreadsheetId: SPREAD_SHEET_ID,
    range: `${CASE_SHEET_NAME}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [CASE_HEADERS] },
  });
};

const normalizeDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime()) ? date : d.toISOString();
};

const buildRows = (caseItem) => {
  const id = caseItem._id.toString();
  const caso = caseItem.caso_o_sentencia || '';
  const fecExp = normalizeDate(caseItem.fecha_expedicion_requerimiento);
  const fecLim = normalizeDate(caseItem.fecha_limite_requerimiento);
  const estado = caseItem.case_estado || '';
  const acciones = caseItem.case_acciones || '';
  const createdAt = caseItem.createdAt ? normalizeDate(caseItem.createdAt) : '';
  const updatedAt = caseItem.updatedAt ? normalizeDate(caseItem.updatedAt) : '';

  const municipios = Array.isArray(caseItem.municipios) ? caseItem.municipios : [];

  if (municipios.length === 0) {
    return [[id, caso, '', '', fecExp, fecLim, estado, acciones, createdAt, updatedAt]];
  }

  return municipios.map(m => [
    id,
    caso,
    m.municipio || '',
    m.aso_org_terri || '',
    fecExp,
    fecLim,
    estado,
    acciones,
    createdAt,
    updatedAt,
  ]);
};

const padRow = (row) => {
  const padded = [...row];
  while (padded.length < CASE_HEADERS.length) {
    padded.push('');
  }
  return padded;
};

const getAllDataRows = async () => {
  const res = await googleSheetsClient.spreadsheets.values.get({
    spreadsheetId: SPREAD_SHEET_ID,
    range: `${CASE_SHEET_NAME}!A2:J5000`,
  });
  return (res.data.values || []).map(padRow);
};

export const addCaseToSheet = async (caseItem) => {
  await ensureSheetExists(CASE_SHEET_NAME, CASE_HEADERS);
  await upsertHeaders();

  const rows = buildRows(caseItem);
  if (rows.length === 0) return;

  await googleSheetsClient.spreadsheets.values.append({
    spreadsheetId: SPREAD_SHEET_ID,
    range: `${CASE_SHEET_NAME}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
};

export const updateCaseInSheet = async (caseItem) => {
  await ensureSheetExists(CASE_SHEET_NAME, CASE_HEADERS);
  await upsertHeaders();

  const caseId = caseItem._id.toString();
  const existingRows = await getAllDataRows();
  const remainingRows = existingRows.filter(row => row[0] !== caseId);
  const newRows = buildRows(caseItem);
  const allRows = [...remainingRows, ...newRows];

  if (existingRows.length > 0) {
    await googleSheetsClient.spreadsheets.values.clear({
      spreadsheetId: SPREAD_SHEET_ID,
      range: `${CASE_SHEET_NAME}!A2:J${existingRows.length + 1}`,
    });
  }

  if (allRows.length > 0) {
    await googleSheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREAD_SHEET_ID,
      range: `${CASE_SHEET_NAME}!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: allRows },
    });
  }
};

export const deleteCaseFromSheet = async (id) => {
  const sheetId = await getSheetIdByName(CASE_SHEET_NAME);
  if (sheetId === undefined) return;

  const caseIdStr = id.toString();
  const existingRows = await getAllDataRows();
  const remainingRows = existingRows.filter(row => row[0] !== caseIdStr);

  if (remainingRows.length === existingRows.length) return;

  if (existingRows.length > 0) {
    await googleSheetsClient.spreadsheets.values.clear({
      spreadsheetId: SPREAD_SHEET_ID,
      range: `${CASE_SHEET_NAME}!A2:J${existingRows.length + 1}`,
    });
  }

  if (remainingRows.length > 0) {
    await googleSheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREAD_SHEET_ID,
      range: `${CASE_SHEET_NAME}!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: remainingRows },
    });
  }
};
