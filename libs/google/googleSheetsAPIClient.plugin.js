import 'dotenv/config'
import { google } from 'googleapis';

let credentials;
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
}

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const googleSheetsClient = google.sheets({ version: 'v4', auth });