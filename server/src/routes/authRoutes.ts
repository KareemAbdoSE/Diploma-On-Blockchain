// src/routes/authRoutes.ts
import express from 'express';
import { register, login, confirmEmail, registerUniversityAdmin } from '../controllers/authController';
import { body } from 'express-validator';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

// Registration Route for Students
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  asyncHandler(register)
);

// Login Route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  asyncHandler(login)
);

// Email Verification Route
router.get(
  '/confirm-email',
  asyncHandler(confirmEmail)
);

// University Admin Registration Route
router.post(
  '/register-university-admin',
  [
    body('token').notEmpty().withMessage('Invitation token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  asyncHandler(registerUniversityAdmin)
);

export default router;
