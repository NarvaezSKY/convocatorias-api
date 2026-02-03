import { googleSheetsClient } from '../../libs/google/googleSheetsAPIClient.plugin.js';
import { SPREAD_SHEET_ID, SHEET_NAME_USERS } from '../../config/token.js';

export const addUserToSheet = async (user) => {
    console.log('📝 Agregando usuario a Google Sheets:', user._id);
    await googleSheetsClient.spreadsheets.values.append({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${SHEET_NAME_USERS}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                user._id.toString(),
                user.username,
                user.email,
                user.role,
                user.telefono || '',
                user.estado,
                user.SENAemail,
                user.areaDeTrabajo || '',
                user.clasificacionMinCiencias || '',
                user.CvLAC || '',
                user.SemilleroInvestigacion || '',
                user.centroDeFormacion || '',
            ]]
        }
    });
    console.log('✅ Usuario agregado exitosamente a Google Sheets');
};

const getSheetIdByName = async (sheetName) => {
    const res = await googleSheetsClient.spreadsheets.get({
        spreadsheetId: SPREAD_SHEET_ID,
    });

    const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
    return sheet?.properties.sheetId;
};

export const updateUserInSheet = async (user) => {
    console.log('🔄 Actualizando usuario en Google Sheets:', user._id.toString());
    
    const rows = await googleSheetsClient.spreadsheets.values.get({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${SHEET_NAME_USERS}!A2:Z1000`,
    });

    const values = rows.data.values;
    console.log('📊 Filas encontradas:', values?.length || 0);
    
    if (!values || values.length === 0) {
        console.log('⚠️ No hay datos en la hoja. Agregando usuario...');
        await addUserToSheet(user);
        return;
    }

    const rowIndex = values.findIndex(row => row[0] === user._id.toString());
    console.log('🔍 Índice de fila encontrado:', rowIndex);

    if (rowIndex === -1) {
        console.log('⚠️ Usuario no encontrado en sheet. Agregando...');
        await addUserToSheet(user);
        return;
    }

    const range = `${SHEET_NAME_USERS}!A${rowIndex + 2}`;
    console.log('📍 Actualizando en rango:', range);
    
    await googleSheetsClient.spreadsheets.values.update({
        spreadsheetId: SPREAD_SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                user._id.toString(),
                user.username,
                user.email,
                user.role,
                user.telefono || '',
                user.estado,
                user.SENAemail,
                user.areaDeTrabajo || '',
                user.clasificacionMinCiencias || '',
                user.CvLAC || '',
                user.SemilleroInvestigacion || '',
                user.centroDeFormacion || '',
            ]]
        }
    });
    console.log('✅ Usuario actualizado exitosamente en Google Sheets');
};

export const deleteUserFromSheet = async (id) => {
    const sheetId = await getSheetIdByName(SHEET_NAME_USERS);
    if (sheetId === undefined) throw new Error("Sheet name not found");

    const rows = await googleSheetsClient.spreadsheets.values.get({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${SHEET_NAME_USERS}!A2:Z1000`,
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
