import { googleSheetsClient } from '../../libs/google/googleSheetsAPIClient.plugin.js';
import { SPREAD_SHEET_ID, SHEET_NAME } from '../../config/token.js';

const BENEFICIARIOS_SHEET_NAME = process.env.SHEET_NAME_BENEFICIARIOS_MUNICIPIO || 'BeneficiariosPorMunicipio';
const BENEFICIARIOS_HEADERS = [
    'convocatoria_id',
    'convocatoria',
    'consecutivo',
    'nombre_proyecto',
    'centro_formacion',
    'tipos_poblaciones_atendidas',
    'valor_solicitado',
    'valor_aprobado',
    'year',
    'municipio',
    'beneficiarios_directos',
    'beneficiarios_indirectos',
    'beneficiarios_totales',
];

const normalizeBeneficiariosRows = (convocatoria) => {
    if (!Array.isArray(convocatoria.beneficiariosPorMunicipio)) {
        return [];
    }

    const tiposPoblacionesAtendidas = Array.isArray(convocatoria.tiposPoblacionesAtendidas)
        ? convocatoria.tiposPoblacionesAtendidas.join(', ')
        : (convocatoria.tiposPoblacionesAtendidas || '');

    return convocatoria.beneficiariosPorMunicipio.map((item) => {
        const directos = Number(item?.directos) || 0;
        const indirectos = Number(item?.indirectos) || 0;

        return [
            convocatoria._id.toString(),
            convocatoria.convocatoria || '',
            convocatoria.consecutivo || '',
            convocatoria.nombre || '',
            convocatoria.direccion_oficina_regional || '',
            tiposPoblacionesAtendidas,
            convocatoria.valor_solicitado || '',
            convocatoria.valor_aprobado || '',
            convocatoria.year || '',
            item?.municipio || '',
            directos,
            indirectos,
            directos + indirectos,
        ];
    });
};

const removeBeneficiariosRowsFromSheet = async (convocatoriaId) => {
    const sheetId = await getSheetIdByName(BENEFICIARIOS_SHEET_NAME);
    if (sheetId === undefined) return;

    const rows = await googleSheetsClient.spreadsheets.values.get({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${BENEFICIARIOS_SHEET_NAME}!A2:M50000`,
    });

    const values = rows.data.values || [];
    const matches = values
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => row[0] === convocatoriaId.toString());

    if (matches.length === 0) return;

    const requests = matches
        .sort((a, b) => b.index - a.index)
        .map(({ index }) => ({
            deleteDimension: {
                range: {
                    sheetId,
                    dimension: 'ROWS',
                    startIndex: index + 1,
                    endIndex: index + 2,
                },
            },
        }));

    await googleSheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: SPREAD_SHEET_ID,
        requestBody: { requests },
    });
};

const syncBeneficiariosRowsInSheet = async (convocatoria) => {
    await ensureSheetExists(BENEFICIARIOS_SHEET_NAME, BENEFICIARIOS_HEADERS);
    await upsertBeneficiariosHeaders();
    await removeBeneficiariosRowsFromSheet(convocatoria._id);

    const beneficiariosRows = normalizeBeneficiariosRows(convocatoria);
    if (beneficiariosRows.length === 0) return;

    await googleSheetsClient.spreadsheets.values.append({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${BENEFICIARIOS_SHEET_NAME}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: beneficiariosRows,
        },
    });
};

const upsertBeneficiariosHeaders = async () => {
    await googleSheetsClient.spreadsheets.values.update({
        spreadsheetId: SPREAD_SHEET_ID,
        range: `${BENEFICIARIOS_SHEET_NAME}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [BENEFICIARIOS_HEADERS],
        },
    });
};

const ensureSheetExists = async (sheetName, headers = []) => {
    const existingSheetId = await getSheetIdByName(sheetName);
    if (existingSheetId !== undefined) {
        return existingSheetId;
    }

    const createSheetResponse = await googleSheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: SPREAD_SHEET_ID,
        requestBody: {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: sheetName,
                        },
                    },
                },
            ],
        },
    });

    if (Array.isArray(headers) && headers.length > 0) {
        await googleSheetsClient.spreadsheets.values.update({
            spreadsheetId: SPREAD_SHEET_ID,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [headers],
            },
        });
    }

    return createSheetResponse.data?.replies?.[0]?.addSheet?.properties?.sheetId;
};

export const addConvocatoriaToSheet = async (convocatoria) => {
    // Asegurar que user_id sea un string y no un objeto completo
    const userIdValue = convocatoria.user_id && typeof convocatoria.user_id === 'object'
        ? (convocatoria.user_id._id?.toString() || '')
        : (convocatoria.user_id ? convocatoria.user_id.toString() : '');

    // Opcional: contar usuarios asociados (array many-to-many)
    const usersCount = Array.isArray(convocatoria.users) ? convocatoria.users.length : 0;

    // Convertir arrays de población objetivo a strings
    const departamentosDeImpacto = Array.isArray(convocatoria.departamentosDeImpacto) 
        ? convocatoria.departamentosDeImpacto.join(', ') 
        : (convocatoria.departamentosDeImpacto || '');
    const municipiosDeImpacto = Array.isArray(convocatoria.municipiosDeImpacto) 
        ? convocatoria.municipiosDeImpacto.join(', ') 
        : (convocatoria.municipiosDeImpacto || '');
    const tiposPoblacionesAtendidas = Array.isArray(convocatoria.tiposPoblacionesAtendidas) 
        ? convocatoria.tiposPoblacionesAtendidas.join(', ') 
        : (convocatoria.tiposPoblacionesAtendidas || '');
    const programasRelacionados = Array.isArray(convocatoria.programasRelacionados)
        ? convocatoria.programasRelacionados.join(', ')
        : (convocatoria.programasRelacionados || '');
    const beneficiariosPorMunicipio = Array.isArray(convocatoria.beneficiariosPorMunicipio)
        ? JSON.stringify(convocatoria.beneficiariosPorMunicipio)
        : '';

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
                departamentosDeImpacto,
                municipiosDeImpacto,
                tiposPoblacionesAtendidas,
                convocatoria.numeroBeneficiariosDirectos || '',
                convocatoria.numeroBeneficiariosIndirectos || '',
                programasRelacionados,
                beneficiariosPorMunicipio,
            ]]
        }
    });

    await syncBeneficiariosRowsInSheet(convocatoria);
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
        range: `${SHEET_NAME}!A2:AA1000`,
    });

    const values = rows.data.values;
    const rowIndex = values?.findIndex(row => row[0] === convocatoria._id.toString());

    if (rowIndex === -1) return;

    const userIdValue = convocatoria.user_id && typeof convocatoria.user_id === 'object'
        ? (convocatoria.user_id._id?.toString() || '')
        : (convocatoria.user_id ? convocatoria.user_id.toString() : '');
    const usersCount = Array.isArray(convocatoria.users) ? convocatoria.users.length : 0;

    // Convertir arrays de población objetivo a strings
    const departamentosDeImpacto = Array.isArray(convocatoria.departamentosDeImpacto) 
        ? convocatoria.departamentosDeImpacto.join(', ') 
        : (convocatoria.departamentosDeImpacto || '');
    const municipiosDeImpacto = Array.isArray(convocatoria.municipiosDeImpacto) 
        ? convocatoria.municipiosDeImpacto.join(', ') 
        : (convocatoria.municipiosDeImpacto || '');
    const tiposPoblacionesAtendidas = Array.isArray(convocatoria.tiposPoblacionesAtendidas) 
        ? convocatoria.tiposPoblacionesAtendidas.join(', ') 
        : (convocatoria.tiposPoblacionesAtendidas || '');
    const programasRelacionados = Array.isArray(convocatoria.programasRelacionados)
        ? convocatoria.programasRelacionados.join(', ')
        : (convocatoria.programasRelacionados || '');
    const beneficiariosPorMunicipio = Array.isArray(convocatoria.beneficiariosPorMunicipio)
        ? JSON.stringify(convocatoria.beneficiariosPorMunicipio)
        : '';

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
                departamentosDeImpacto,
                municipiosDeImpacto,
                tiposPoblacionesAtendidas,
                convocatoria.numeroBeneficiariosDirectos || '',
                convocatoria.numeroBeneficiariosIndirectos || '',
                programasRelacionados,
                beneficiariosPorMunicipio,
            ]]
        }
    });

    await syncBeneficiariosRowsInSheet(convocatoria);
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

    await removeBeneficiariosRowsFromSheet(id);
};
