import { Router } from "express";
import {
  getConvocatoriasController,
  createConvocatoriaController,
  updateConvocatoriaController,
  deleteConvocatoriaController,
  filterConvocatoriasController,
} from "../controllers/convocatoria.controller.js";
import { verifyToken } from "../../shared/middlewares/verifyToken.js";
import { verifyRole } from "../../shared/middlewares/verifyRole.js";

const router = Router();
router.get("/get", verifyToken, getConvocatoriasController);
router.post(
  "/upload",
  verifyToken,
  verifyRole("admin"),
  createConvocatoriaController
);
router.patch(
  "/update/:id",
  verifyToken,
  verifyRole("admin"),
  updateConvocatoriaController
);
router.delete(
  "/delete/:id",
  verifyToken,
  verifyRole("admin"),
  deleteConvocatoriaController
);

router.get("/filter", verifyToken, filterConvocatoriasController);

export default router;
