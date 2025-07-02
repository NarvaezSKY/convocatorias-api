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
import { ADMIN_ROLE, SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE } from "../../config/token.js";

const router = Router();
router.get("/get", verifyToken, getConvocatoriasController);
router.post(
  "/upload",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE]),
  createConvocatoriaController
);
router.patch(
  "/update/:id",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE]),
  updateConvocatoriaController
);
router.delete(
  "/delete/:id",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE]),
  deleteConvocatoriaController
);

router.get("/filter", verifyToken, filterConvocatoriasController);

router.get(
  "/get/:id",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE]),
  getConvocatoriaByIdController
);

export default router;
