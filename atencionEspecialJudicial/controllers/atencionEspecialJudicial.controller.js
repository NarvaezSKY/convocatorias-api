import {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  filterCases,
} from "../services/atencionEspecialJudicial.service.js";

export const getCasesController = async (req, res) => {
  try {
    const cases = await getAllCases();
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCaseByIdController = async (req, res) => {
  try {
    const caseItem = await getCaseById(req.params.id);
    res.json(caseItem);
  } catch (error) {
    const message = error.message || "Unexpected error";
    res.status(message === "Case not found" ? 404 : 500).json({ message });
  }
};

export const createCaseController = async (req, res) => {
  try {
    const data = req.body;
    if (!data) return res.status(400).json({ message: "Data is required" });
    const caseItem = await createCase(data);
    res.status(201).json(caseItem);
  } catch (error) {
    const message = error.message || "Unexpected error";
    const isValidationError =
      message.includes("required") ||
      message.includes("validation") ||
      message.includes("must") ||
      message.includes("enum") ||
      message.includes("debe ser") ||
      message.includes("existe");
    res.status(isValidationError ? 400 : 500).json({ message });
  }
};

export const updateCaseController = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const updated = await updateCase(id, data);
    res.json(updated);
  } catch (error) {
    const message = error.message || "Unexpected error";
    const isValidationError =
      message.includes("required") ||
      message.includes("validation") ||
      message.includes("must") ||
      message.includes("enum") ||
      message.includes("debe ser") ||
      message.includes("existe");
    const status = message === "Case not found" ? 404 : isValidationError ? 400 : 500;
    res.status(status).json({ message });
  }
};

export const deleteCaseController = async (req, res) => {
  try {
    const result = await deleteCase(req.params.id);
    res.json(result);
  } catch (error) {
    const message = error.message || "Unexpected error";
    res.status(message === "Case not found" ? 404 : 500).json({ message });
  }
};

export const filterCasesController = async (req, res) => {
  try {
    const results = await filterCases(req.query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
