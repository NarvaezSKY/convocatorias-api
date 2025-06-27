import dotenv from "dotenv";
dotenv.config();

export const TOKEN_SECRET = process.env.TOKEN_SECRET
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD
export const SUPER_ADMIN_ROLE = process.env.SUPER_ADMIN_ROLE
export const DINAMIZADOR_ROLE = process.env.DINAMIZADOR_ROLE
export const ADMIN_ROLE = process.env.ADMIN_ROLE
export const USER_ROLE = process.env.USER_ROLE

export const GOOGLE_KEY_JSON_PATH = process.env.GOOGLE_KEY_JSON_PATH
export const SPREAD_SHEET_ID = process.env.SPREAD_SHEET_ID
export const SHEET_NAME = process.env.SHEET_NAME

export const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
export const GOOGLE_EMAIL_PASSWORD = process.env.GOOGLE_EMAIL_PASSWORD

export const FRONTEND_PROD_URL = process.env.FRONTEND_PROD_URL
export const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL


