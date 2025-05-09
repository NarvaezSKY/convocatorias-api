import { Op } from 'sequelize';
import { Convocatoria } from '../../models/Convocatoria.js';

export const getAllConvocatorias = async () => {
  return await Convocatoria.findAll();
};

export const createConvocatoria = async (data, userId) => {
  const valorSolicitado = parseFloat(data.valor_solicitado) || 0;
  const valorAprobado = parseFloat(data.valor_aprobado) || 0;

  const diferenciaPresupuesto = valorSolicitado - valorAprobado;

  return await Convocatoria.create({
    ...data,
    user_id: userId,
    diferencia_presupuesto: diferenciaPresupuesto
  });
};


export const updateConvocatoria = async (id, data) => {
  const convocatoria = await Convocatoria.findByPk(id);
  if (!convocatoria) throw new Error('Convocatoria not found');
  return await convocatoria.update(data);
};

export const deleteConvocatoria = async (id) => {
  const convocatoria = await Convocatoria.findByPk(id);
  if (!convocatoria) throw new Error('Convocatoria not found');
  await convocatoria.destroy();
  return { message: 'Convocatoria deleted' };
};

export const filterConvocatorias = async (filters) => {
  const whereClause = {};

  for (const key in filters) {
    if (filters[key]) {
      whereClause[key] = {
        [Op.like]: `%${filters[key]}%`
      };
    }
  }

  return await Convocatoria.findAll({
    where: whereClause
  });
};

export const getConvocatoriaById = async (id) => {
  const convocatoria = await Convocatoria.findByPk(id);
  if (!convocatoria) throw new Error('Convocatoria not found');
  return convocatoria;
};
