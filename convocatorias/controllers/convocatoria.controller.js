import {
  getAllConvocatorias,
  createConvocatoria,
  updateConvocatoria,
  deleteConvocatoria,
  filterConvocatorias,
  getConvocatoriaById,
  generateConvocatoriasReport,
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
    const userId = req.user.id;
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: "Data is required" });
    }
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
    const { report, ...filters } = req.query;

    // if (Object.keys(filters).length === 0) {
    //   return res
    //     .status(400)
    //     .json({ message: "At least one filter is required" });
    // }

    const results = await filterConvocatorias(filters);

    if (report === "true") {
      const workbook = await generateConvocatoriasReport(results);
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=reporte.xlsx"
      );
      res.send(buffer);
      return;
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const getConvocatoriaByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const convocatoria = await getConvocatoriaById(id);
    if (!convocatoria) {
      return res.status(404).json({ message: "Convocatoria not found" });
    }
    res.json(convocatoria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
