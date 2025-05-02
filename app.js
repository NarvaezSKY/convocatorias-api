import express from "express";
import cors from "cors";
import authRouter from "./auth/routes/auth.routes.js";
import convocatoriasRouter from "./convocatorias/routes/convocatoria.routes.js";
import morgan from "morgan";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://test-sena-book-git-ft-2335-senathreads.vercel.app",
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

export default app;