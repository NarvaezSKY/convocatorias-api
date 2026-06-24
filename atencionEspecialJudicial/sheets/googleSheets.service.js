import { googleSheetsClient } from '../../libs/google/googleSheetsAPIClient.plugin.js';
import { SPREAD_SHEET_ID } from '../../config/token.js';

const CASE_SHEET_NAME = process.env.SHEET_NAME_CASES || 'Cases';

const CASE_HEADERS = [
  'id',
  'caso_o_sentencia',
  'municipios',
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

const serializeMunicipios = (municipios) => {
  if (!Array.isArray(municipios)) return '';
  return JSON.stringify(municipios);
};

export const addCaseToSheet = async (caseItem) => {
  await ensureSheetExists(CASE_SHEET_NAME, CASE_HEADERS);
  await upsertHeaders();

  await googleSheetsClient.spreadsheets.values.append({
    spreadsheetId: SPREAD_SHEET_ID,
    range: `${CASE_SHEET_NAME}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        caseItem._id.toString(),
        caseItem.caso_o_sentencia || '',
        serializeMunicipios(caseItem.municipios),
        normalizeDate(caseItem.fecha_expedicion_requerimiento),
        normalizeDate(caseItem.fecha_limite_requerimiento),
        caseItem.case_estado || '',
        caseItem.case_acciones || '',
        caseItem.createdAt ? normalizeDate(caseItem.createdAt) : '',
        caseItem.updatedAt ? normalizeDate(caseItem.updatedAt) : '',
      ]],
    },
  });
};

export const updateCaseInSheet = async (caseItem) => {
  const sheetId = await ensureSheetExists(CASE_SHEET_NAME, CASE_HEADERS);
  await upsertHeaders();

  const rows = await googleSheetsClient.spreadsheets.values.get({
    spreadsheetId: SPREAD_SHEET_ID,
    range: `${CASE_SHEET_NAME}!A2:I5000`,
  });

  const values = rows.data.values;
  const rowIndex = values?.findIndex(row => row[0] === caseItem._id.toString());
  if (rowIndex === -1) return;

  const range = `${CASE_SHEET_NAME}!A${rowIndex + 2}`;
  await googleSheetsClient.spreadsheets.values.update({
    spreadsheetId: SPREAD_SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        caseItem._id.toString(),
        caseItem.caso_o_sentencia || '',
        serializeMunicipios(caseItem.municipios),
        normalizeDate(caseItem.fecha_expedicion_requerimiento),
        normalizeDate(caseItem.fecha_limite_requerimiento),
        caseItem.case_estado || '',
        caseItem.case_acciones || '',
        caseItem.createdAt ? normalizeDate(caseItem.createdAt) : '',
        caseItem.updatedAt ? normalizeDate(caseItem.updatedAt) : '',
      ]],
    },
  });
};

export const deleteCaseFromSheet = async (id) => {
  const sheetId = await getSheetIdByName(CASE_SHEET_NAME);
  if (sheetId === undefined) return;

  const rows = await googleSheetsClient.spreadsheets.values.get({
    spreadsheetId: SPREAD_SHEET_ID,
    range: `${CASE_SHEET_NAME}!A2:I5000`,
  });

  const values = rows.data.values;
  const rowIndex = values?.findIndex(row => row[0] === id.toString());
  if (rowIndex === -1) return;

  await googleSheetsClient.spreadsheets.batchUpdate({
    spreadsheetId: SPREAD_SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex + 1,
            endIndex: rowIndex + 2,
          },
        },
      }],
    },
  });
};
