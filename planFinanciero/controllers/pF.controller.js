import {
  getPlanFinancieroByIdService,
  createPlanFinancieroService,
  updatePlanFinancieroService,
} from "../services/pF.service.js";

export const getPlanFinancieroById = async (req, res) => {
  try {
    const id = req.params.id;
    const planFinanciero = await getPlanFinancieroByIdService(id);
    res.json(planFinanciero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlanFinanciero = async (req, res) => {
  try {
    const data = req.body;
    const planFinanciero = await createPlanFinancieroService(data);
    res.status(201).json(planFinanciero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlanFinanciero = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const planFinanciero = await updatePlanFinancieroService(id, data);
    res.json(planFinanciero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
