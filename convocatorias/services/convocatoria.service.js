import { Op } from 'sequelize';
import { Convocatoria } from '../../models/Convocatoria.js';

export const getAllConvocatorias = async () => {
  return await Convocatoria.findAll();
};

export const createConvocatoria = async (data, userId) => {
  return await Convocatoria.create({ ...data, user_id: userId });
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
