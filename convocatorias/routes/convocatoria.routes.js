import { Router } from "express";
import {
  getConvocatoriasController,
  createConvocatoriaController,
  updateConvocatoriaController,
  deleteConvocatoriaController,
  filterConvocatoriasController,
  getConvocatoriaByIdController,  
} from "../controllers/convocatoria.controller.js";
import { verifyToken } from "../../shared/middlewares/verifyToken.js";
import { verifyRole } from "../../shared/middlewares/verifyRole.js";
import { SUPER_ADMIN_ROLE } from "../../config/token.js";

const router = Router();
router.get("/get", verifyToken, getConvocatoriasController);
router.post(
  "/upload",
  verifyToken,
  verifyRole(SUPER_ADMIN_ROLE),
  createConvocatoriaController
);
router.patch(
  "/update/:id",
  verifyToken,
  verifyRole(SUPER_ADMIN_ROLE),
  updateConvocatoriaController
);
router.delete(
  "/delete/:id",
  verifyToken,
  verifyRole(SUPER_ADMIN_ROLE),
  deleteConvocatoriaController
);

router.get("/filter", verifyToken, filterConvocatoriasController);

router.get(
  "/get/:id",
  verifyToken,
  verifyRole(SUPER_ADMIN_ROLE),
  getConvocatoriaByIdController
);

export default router;
