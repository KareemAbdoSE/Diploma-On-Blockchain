// src/routes/paymentRoutes.ts
import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

router.post('/create-payment-intent', authenticateJWT, asyncHandler(createPaymentIntent));

export default router;
