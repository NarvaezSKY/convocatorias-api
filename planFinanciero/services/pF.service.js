import { PlanFinanciero } from "../../models/PlanFinanciero.js";

export const getAllPlanFinancierosService = async () => {
  return await PlanFinanciero.find().populate("convocatoria");
};

export const getPlanFinancieroByIdService = async (id) => {
  const planFinanciero = await PlanFinanciero.findOne({
    convocatoria: id,
  }).populate("convocatoria");
  if (!planFinanciero)
    throw new Error("This 'convocatoria' doesn't have a 'plan financiero' yet");
  return planFinanciero;
};

export const createPlanFinancieroService = async (data) => {
  return await PlanFinanciero.create(data);
};

export const updatePlanFinancieroService = async (id, data) => {
  const planFinanciero = await PlanFinanciero.findById(id);
  if (!planFinanciero) throw new Error("Plan Financiero not found");
  Object.assign(planFinanciero, data);
  return await planFinanciero.save();
};
