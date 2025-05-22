import 'dotenv/config'
import { google } from 'googleapis';
import * as path from 'path'
import { GOOGLE_KEY_JSON_PATH } from '../../config/token.js';

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(import.meta.dirname, "..", "..", GOOGLE_KEY_JSON_PATH),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const googleSheetsClient = google.sheets({ version: 'v4', auth });