import { Router } from "express";
import {
  getCasesController,
  getCaseByIdController,
  createCaseController,
  updateCaseController,
  deleteCaseController,
  filterCasesController,
} from "../controllers/atencionEspecialJudicial.controller.js";
import { verifyToken } from "../../shared/middlewares/verifyToken.js";
import { verifyRole } from "../../shared/middlewares/verifyRole.js";
import {
  ADMIN_ROLE,
  SUPER_ADMIN_ROLE,
  DINAMIZADOR_ROLE,
  USER_ROLE,
  LINVESTIGADOR_ROLE,
  COORDINADOR_ROLE,
} from "../../config/token.js";

const router = Router();

/**
 * @openapi
 * /api/atencion-especial-judicial:
 *   get:
 *     tags: [Atención Especial - Judicial]
 *     summary: Obtener todos los cases
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Case'
 *       401:
 *         description: No autorizado
 */
router.get("/", verifyToken, getCasesController);

/**
 * @openapi
 * /api/atencion-especial-judicial/filter:
 *   get:
 *     tags: [Atención Especial - Judicial]
 *     summary: Filtrar cases por query params
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: caso_o_sentencia
 *         schema: { type: string }
 *       - in: query
 *         name: municipio
 *         schema: { type: string }
 *       - in: query
 *         name: aso_org_terri
 *         schema: { type: string }
 *       - in: query
 *         name: case_estado
 *         schema: { type: string, enum: ["Por atender", "En atención", "Atendido"] }
 *       - in: query
 *         name: case_acciones
 *         schema: { type: string }
 *       - in: query
 *         name: fecha_expedicion_requerimiento
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fecha_limite_requerimiento
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Cases filtrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Case'
 */
router.get("/filter", verifyToken, filterCasesController);

/**
 * @openapi
 * /api/atencion-especial-judicial/{id}:
 *   get:
 *     tags: [Atención Especial - Judicial]
 *     summary: Obtener un case por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Case encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       404:
 *         description: Case no encontrado
 *       401:
 *         description: No autorizado
 */
router.get("/:id", verifyToken, getCaseByIdController);

/**
 * @openapi
 * /api/atencion-especial-judicial:
 *   post:
 *     tags: [Atención Especial - Judicial]
 *     summary: Crear un nuevo case
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Case'
 *     responses:
 *       201:
 *         description: Case creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       400:
 *         description: Error de validación (campos requeridos, duplicado caso_o_sentencia, fechas inválidas)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente
 */
router.post("/", verifyToken, verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE, COORDINADOR_ROLE]), createCaseController);

/**
 * @openapi
 * /api/atencion-especial-judicial/{id}:
 *   patch:
 *     tags: [Atención Especial - Judicial]
 *     summary: Actualizar un case por ID (parcial)
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
 *             $ref: '#/components/schemas/Case'
 *     responses:
 *       200:
 *         description: Case actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Case no encontrado
 *       401:
 *         description: No autorizado
 */
router.patch("/:id", verifyToken, verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE]), updateCaseController);

/**
 * @openapi
 * /api/atencion-especial-judicial/{id}:
 *   delete:
 *     tags: [Atención Especial - Judicial]
 *     summary: Eliminar un case por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Case eliminado
 *       404:
 *         description: Case no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete("/:id", verifyToken, verifyRole([SUPER_ADMIN_ROLE, ADMIN_ROLE, DINAMIZADOR_ROLE, USER_ROLE, LINVESTIGADOR_ROLE]), deleteCaseController);

export default router;
