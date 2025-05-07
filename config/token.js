import dotenv from "dotenv";
dotenv.config();

export const TOKEN_SECRET = process.env.TOKEN_SECRET
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD
export const SUPER_ADMIN_ROLE = process.env.SUPER_ADMIN_ROLE
export const ADMIN_ROLE = process.env.ADMIN_ROLE
export const USER_ROLE = process.env.USER_ROLE