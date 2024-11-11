// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  logger.info('Health check endpoint was called');
  res.status(200).send('Server is healthy');
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
