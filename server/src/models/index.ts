// src/models/index.ts
import sequelize from '../config/database';
import { User } from './user';
import University from './university';
import Role from './role';

// Initialize models
User.initModel(sequelize);
University.initModel(sequelize);
Role.initModel(sequelize);

// Define associations
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

export { sequelize, User, University, Role };
