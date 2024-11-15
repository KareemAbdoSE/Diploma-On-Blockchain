// src/routes/authRoutes.ts
import express from 'express';
import { register, login, confirmEmail } from '../controllers/authController';
import { body } from 'express-validator';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

// Registration Route
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  asyncHandler(register) // Wrap register in asyncHandler
);

// Login Route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  asyncHandler(login) // Wrap login in asyncHandler
);

// Email Verification Route
router.get(
  '/confirm-email',
  asyncHandler(confirmEmail) // Wrap confirmEmail in asyncHandler
);

export default router;
