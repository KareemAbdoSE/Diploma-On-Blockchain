// src/routes/userRoutes.ts

import express from 'express';
import { body } from 'express-validator';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { updateWalletAddress, getWalletAddress } from '../controllers/userController';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

// Update wallet address
router.post(
  '/wallet-address',
  authenticateJWT,
  [
    body('walletAddress')
      .notEmpty()
      .withMessage('Wallet address is required')
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum address format'),
  ],
  asyncHandler(updateWalletAddress)
);

// Get wallet address
router.get('/wallet-address', authenticateJWT, asyncHandler(getWalletAddress));

export default router;
