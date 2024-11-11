// testConnection.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'diploma-verification',
    process.env.DB_USER || 'kareemabdose',
    process.env.DB_PASSWORD || 'Kabdo-2001',
    {
        host: process.env.DB_HOST || '172.18.0.2',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000, // Increase acquire timeout
            idle: 10000,
        },
    }
);


sequelize.authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    })
    .finally(() => {
        sequelize.close();
    });
