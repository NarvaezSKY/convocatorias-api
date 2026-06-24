import {
  getPlanFinancieroById,
  createPlanFinanciero,
  updatePlanFinanciero,
} from "../controllers/pF.controller.js";
import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /api/plan-financiero/get/{id}:
 *   get:
 *     tags: [Plan Financiero]
 *     summary: Obtener plan financiero por ID de convocatoria
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Plan financiero encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanFinanciero'
 *       404:
 *         description: Plan financiero no encontrado
 */
router.get("/get/:id", getPlanFinancieroById);

/**
 * @openapi
 * /api/plan-financiero/create:
 *   post:
 *     tags: [Plan Financiero]
 *     summary: Crear un nuevo plan financiero
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanFinanciero'
 *     responses:
 *       201:
 *         description: Plan financiero creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanFinanciero'
 *       400:
 *         description: Error de validación
 */
router.post("/create", createPlanFinanciero);

/**
 * @openapi
 * /api/plan-financiero/update/{id}:
 *   patch:
 *     tags: [Plan Financiero]
 *     summary: Actualizar un plan financiero por ID
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
 *     responses:
 *       200:
 *         description: Plan financiero actualizado
 *       404:
 *         description: Plan financiero no encontrado
 */
router.patch("/update/:id", updatePlanFinanciero);

export default router;
