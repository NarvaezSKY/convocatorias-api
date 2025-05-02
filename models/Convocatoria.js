import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export const Convocatoria = sequelize.define('Convocatoria', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  convocatoria: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  consecutivo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  direccion_oficina_regional: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  tipo_postulacion: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  nuevo_estado: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  valor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  fecha_aprobacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
  
}, {
  tableName: 'convocatoria',
  timestamps: false
});
