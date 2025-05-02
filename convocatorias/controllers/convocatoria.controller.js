import {
  getAllConvocatorias,
  createConvocatoria,
  updateConvocatoria,
  deleteConvocatoria,
  filterConvocatorias,
} from "../services/convocatoria.service.js";

export const getConvocatoriasController = async (req, res) => {
  try {
    const convocatorias = await getAllConvocatorias();
    res.json(convocatorias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConvocatoriaController = async (req, res) => {
  try {
    const userId = req.user.id; // desde el token verificado
    const data = req.body;
    const convocatoria = await createConvocatoria(data, userId);
    res.status(201).json(convocatoria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConvocatoriaController = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const updated = await updateConvocatoria(id, data);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteConvocatoriaController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteConvocatoria(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const filterConvocatoriasController = async (req, res) => {
  try {
    const filters = req.query;

    if (Object.keys(filters).length === 0) {
      return res
        .status(400)
        .json({ message: "At least one filter is required" });
    }

    const results = await filterConvocatorias(filters);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
