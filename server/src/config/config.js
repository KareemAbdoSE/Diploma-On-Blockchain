require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'kareemabdose',
        password: process.env.DB_PASSWORD || 'Kabdo-2001',
        database: process.env.DB_NAME || 'diploma-verification',
        host: process.env.DB_HOST || '172.18.0.2', // Use the Docker container IP
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log, // Enable detailed logging for debugging
        pool: {
            max: 5,
            min: 0,
            acquire: 60000, // Increase timeout
            idle: 10000,
        },
    },
};

