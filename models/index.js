import { User } from './User.js';
import { Convocatoria } from './Convocatoria.js';

User.hasMany(Convocatoria, { foreignKey: 'user_id' });
Convocatoria.belongsTo(User, { foreignKey: 'user_id' });

export { User, Convocatoria };