// src/database.ts
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

import { User } from './models/User';
import { Role } from './models/Role';
import { University } from './models/University';

dotenv.config(); // Load environment variables

// Initialize Sequelize with database configurations
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'kareemabdoser',
  password: process.env.DB_PASSWORD || 'Kabdo-2001',
  database: process.env.DB_NAME || 'diploma-blockchain',
  models: [User, Role, University], // Register models
  logging: false,
});
