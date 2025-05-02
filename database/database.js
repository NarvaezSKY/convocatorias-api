import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
} from "../config/databaseCredentials.js";

dotenv.config();

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

try {
  await sequelize.authenticate();
  console.log("MySQL connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}
