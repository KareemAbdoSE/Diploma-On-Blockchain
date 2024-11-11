// src/config/database.ts

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME || 'diploma-verification',
    process.env.DB_USER || 'kareemabdose',
    process.env.DB_PASSWORD || 'Kabdo-2001',
    {
        host: process.env.DB_HOST || '172.18.0.2',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        logging: false,
    }
);

sequelize.authenticate()
    .then(() => console.log('Database connection established successfully.'))
    .catch((error) => console.error('Unable to connect to the database:', error));

export default sequelize;
