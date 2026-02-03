import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./auth/routes/auth.routes.js";
import planFinancieroRouter from './planFinanciero/routes/pF.routes.js';
import convocatoriasRouter from "./convocatorias/routes/convocatoria.routes.js";
import { FRONTEND_DEV_URL, FRONTEND_PROD_URL, FRONTEND_STG_URL } from "./config/token.js";

const app = express();

const corsOptions = {
  origin: [
    FRONTEND_DEV_URL,
    FRONTEND_STG_URL,
    FRONTEND_PROD_URL
  ],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/convocatorias", convocatoriasRouter);
app.use("/api/plan-financiero", planFinancieroRouter);

export default app;