import {
  getPlanFinancieroById,
  createPlanFinanciero,
  updatePlanFinanciero,
} from "../controllers/pF.controller.js";
import { Router } from "express";

const router = Router();

router.get("/get/:id", getPlanFinancieroById);
router.post("/create", createPlanFinanciero);
router.patch("/update/:id", updatePlanFinanciero);

export default router;
