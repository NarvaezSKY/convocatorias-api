import { googleSheetsClient } from '../../libs/google/googleSheetsAPIClient.plugin.js';
import { SPREAD_SHEET_ID, SHEET_NAME } from '../../config/token.js';

export const addConvocatoriaToSheet = async (convocatoria) => {
    // Asegurar que user_id sea un string y no un objeto completo
    const userIdValue = convocatoria.user_id && typeof convocatoria.user_id === 'object'
        ? (convocatoria.user_id._id?.toString() || '')
        : (convocatoria.user_id ? convocatoria.user_id.toString() : '');

    // Opcional: contar usuarios asociados (array many-to-many)
    const usersCount = Array.isArray(convocatoria.users) ? convocatoria.users.length : 0;

    await googleSheetsClient.spreadsheets.values.append({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                convocatoria._id.toString(),
                convocatoria.convocatoria,
                convocatoria.consecutivo,
                convocatoria.direccion_oficina_regional,
                convocatoria.tipo_postulacion,
                convocatoria.nuevo_estado,
                convocatoria.nombre,
                convocatoria.fecha_aprobacion,
                convocatoria.fecha_inicio,
                convocatoria.fecha_fin,
                convocatoria.observaciones,
                userIdValue,
                convocatoria.url,
                convocatoria.valor_solicitado,
                convocatoria.valor_aprobado,
                convocatoria.diferencia_presupuesto,
                convocatoria.year,
                usersCount, // nueva columna con número de usuarios vinculados
            ]]
        }
    });
};

const getSheetIdByName = async (sheetName) => {
    const res = await googleSheetsClient.spreadsheets.get({
        spreadsheetId: SPREAD_SHEET_ID,
    });

    const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
    return sheet?.properties.sheetId;
};


export const updateConvocatoriaInSheet = async (convocatoria) => {
    const rows = await googleSheetsClient.spreadsheets.values.get({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${SHEET_NAME}!A2:Z1000`,
    });

    const values = rows.data.values;
    const rowIndex = values?.findIndex(row => row[0] === convocatoria._id.toString());

    if (rowIndex === -1) return;

    const userIdValue = convocatoria.user_id && typeof convocatoria.user_id === 'object'
        ? (convocatoria.user_id._id?.toString() || '')
        : (convocatoria.user_id ? convocatoria.user_id.toString() : '');
    const usersCount = Array.isArray(convocatoria.users) ? convocatoria.users.length : 0;

    const range = `${SHEET_NAME}!A${rowIndex + 2}`;
    await googleSheetsClient.spreadsheets.values.update({
        spreadsheetId: SPREAD_SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                convocatoria._id.toString(),
                convocatoria.convocatoria,
                convocatoria.consecutivo,
                convocatoria.direccion_oficina_regional,
                convocatoria.tipo_postulacion,
                convocatoria.nuevo_estado,
                convocatoria.nombre,
                convocatoria.fecha_aprobacion,
                convocatoria.fecha_inicio,
                convocatoria.fecha_fin,
                convocatoria.observaciones,
                userIdValue,
                convocatoria.url,
                convocatoria.valor_solicitado,
                convocatoria.valor_aprobado,
                convocatoria.diferencia_presupuesto,
                convocatoria.year,
                usersCount,
            ]]
        }
    });
};

export const deleteConvocatoriaFromSheet = async (id) => {
    const sheetId = await getSheetIdByName(SHEET_NAME);
    if (sheetId === undefined) throw new Error("Sheet name not found");

    const rows = await googleSheetsClient.spreadsheets.values.get({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${SHEET_NAME}!A2:Z1000`,
    });

    const values = rows.data.values;
    const rowIndex = values?.findIndex(row => row[0] === id.toString());
    if (rowIndex === -1) return;

    await googleSheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: SPREAD_SHEET_ID,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex + 1,
                            endIndex: rowIndex + 2,
                        },
                    },
                },
            ],
        },
    });
};
