import { Router } from "express";
import {
  getConvocatoriasController,
  createConvocatoriaController,
  updateConvocatoriaController,
  deleteConvocatoriaController,
  filterConvocatoriasController,
  getConvocatoriaByIdController,
  getConvocatoriasByYearController,
  getAvailableYearsController,
  addUserToConvocatoriaController,
  removeUserFromConvocatoriaController,
} from "../controllers/convocatoria.controller.js";
import { verifyToken } from "../../shared/middlewares/verifyToken.js";
import { verifyRole } from "../../shared/middlewares/verifyRole.js";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE, COORDINADOR_ROLE } from "../../config/token.js";

const router = Router();
router.get("/get", verifyToken, getConvocatoriasController);
router.post(
  "/upload",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE, COORDINADOR_ROLE]),
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
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE, COORDINADOR_ROLE]),
  getConvocatoriaByIdController
);

// Nueva ruta para obtener convocatorias por año
router.get(
  "/year/:year",
  verifyToken,
  getConvocatoriasByYearController
);

// Nueva ruta para obtener años disponibles
router.get(
  "/years/available",
  verifyToken,
  getAvailableYearsController
);
router.post(
  "/:id/users/add",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, COORDINADOR_ROLE]),
  addUserToConvocatoriaController
);

router.post(
  "/:id/users/remove",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, COORDINADOR_ROLE]),
  removeUserFromConvocatoriaController
);


export default router;
