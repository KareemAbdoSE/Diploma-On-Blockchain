// src/routes/authRoutes.ts
import express from 'express';
import { register, login } from '../controllers/authController';
import { body } from 'express-validator';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  asyncHandler(register) // Wrap register in asyncHandler
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  asyncHandler(login) // Wrap login in asyncHandler
);

export default router;
