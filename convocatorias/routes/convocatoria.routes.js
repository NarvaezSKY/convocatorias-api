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

/**
 * @openapi
 * /api/convocatorias/get:
 *   get:
 *     tags: [Convocatorias]
 *     summary: Obtener todas las convocatorias
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de convocatorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Convocatoria'
 */
router.get("/get", verifyToken, getConvocatoriasController);

/**
 * @openapi
 * /api/convocatorias/upload:
 *   post:
 *     tags: [Convocatorias]
 *     summary: Crear una nueva convocatoria
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Convocatoria'
 *     responses:
 *       201:
 *         description: Convocatoria creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convocatoria'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post(
  "/upload",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE, COORDINADOR_ROLE]),
  createConvocatoriaController
);

/**
 * @openapi
 * /api/convocatorias/update/{id}:
 *   patch:
 *     tags: [Convocatorias]
 *     summary: Actualizar una convocatoria por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Convocatoria'
 *     responses:
 *       200:
 *         description: Convocatoria actualizada
 *       404:
 *         description: Convocatoria no encontrada
 */
router.patch(
  "/update/:id",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE]),
  updateConvocatoriaController
);

/**
 * @openapi
 * /api/convocatorias/delete/{id}:
 *   delete:
 *     tags: [Convocatorias]
 *     summary: Eliminar una convocatoria por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Convocatoria eliminada
 *       404:
 *         description: Convocatoria no encontrada
 */
router.delete(
  "/delete/:id",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE]),
  deleteConvocatoriaController
);

/**
 * @openapi
 * /api/convocatorias/filter:
 *   get:
 *     tags: [Convocatorias]
 *     summary: Filtrar convocatorias por query params
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: convocatoria
 *         schema: { type: string }
 *       - in: query
 *         name: nombre
 *         schema: { type: string }
 *       - in: query
 *         name: nuevo_estado
 *         schema: { type: string }
 *       - in: query
 *         name: users
 *         schema: { type: string }
 *       - in: query
 *         name: departamentosDeImpacto
 *         schema: { type: string }
 *       - in: query
 *         name: municipiosDeImpacto
 *         schema: { type: string }
 *       - in: query
 *         name: tiposPoblacionesAtendidas
 *         schema: { type: string }
 *       - in: query
 *         name: programasRelacionados
 *         schema: { type: string }
 *       - in: query
 *         name: report
 *         schema: { type: string, enum: [true, false] }
 *     responses:
 *       200:
 *         description: Convocatorias filtradas (o archivo Excel si report=true)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Convocatoria'
 */
router.get("/filter", verifyToken, filterConvocatoriasController);

/**
 * @openapi
 * /api/convocatorias/get/{id}:
 *   get:
 *     tags: [Convocatorias]
 *     summary: Obtener una convocatoria por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Convocatoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convocatoria'
 *       404:
 *         description: Convocatoria no encontrada
 */
router.get(
  "/get/:id",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE, COORDINADOR_ROLE]),
  getConvocatoriaByIdController
);

/**
 * @openapi
 * /api/convocatorias/year/{year}:
 *   get:
 *     tags: [Convocatorias]
 *     summary: Obtener convocatorias por año
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Convocatorias del año
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Convocatoria'
 */
router.get(
  "/year/:year",
  verifyToken,
  getConvocatoriasByYearController
);

/**
 * @openapi
 * /api/convocatorias/years/available:
 *   get:
 *     tags: [Convocatorias]
 *     summary: Obtener años disponibles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de años
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 */
router.get(
  "/years/available",
  verifyToken,
  getAvailableYearsController
);

/**
 * @openapi
 * /api/convocatorias/{id}/users/add:
 *   post:
 *     tags: [Convocatorias]
 *     summary: Agregar un usuario a una convocatoria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: Usuario agregado
 *       400:
 *         description: userId requerido
 *       404:
 *         description: Convocatoria no encontrada
 */
router.post(
  "/:id/users/add",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, COORDINADOR_ROLE]),
  addUserToConvocatoriaController
);

/**
 * @openapi
 * /api/convocatorias/{id}/users/remove:
 *   post:
 *     tags: [Convocatorias]
 *     summary: Eliminar un usuario de una convocatoria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       400:
 *         description: userId requerido
 *       404:
 *         description: Convocatoria no encontrada
 */
router.post(
  "/:id/users/remove",
  verifyToken,
  verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, COORDINADOR_ROLE]),
  removeUserFromConvocatoriaController
);

export default router;
