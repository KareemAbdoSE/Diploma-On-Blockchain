// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './logger';
import { sequelize } from './database';
import authRoutes from './routes/authRoutes';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());          // Sets various HTTP headers for security
app.use(cors());            // Enables Cross-Origin Resource Sharing
app.use(express.json());    // Parses incoming JSON requests

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Use Auth Routes
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();                                        // Test database connection
    res.status(200).send('Server is healthy and database is connected');
  } catch (error) {
    logger.error('Database connection error:', error);
    res.status(500).send('Database connection error');
  }
});

// Start Server
app.listen(PORT, async () => {
  try {
    await sequelize.sync();
    logger.info('Database synced successfully.');
    logger.info(`Server is running on port ${PORT}`);
  } catch (error) {
    logger.error('Unable to sync database:', error);
  }
});
