// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './logger';
import { sequelize } from './database';
import authRoutes from './routes/authRoutes';
import universityRoutes from './routes/universityRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/user', userRoutes);

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
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
