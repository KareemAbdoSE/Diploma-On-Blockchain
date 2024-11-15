// src/routes/universityRoutes.ts
import express from 'express';
import { body } from 'express-validator';
import {
  registerUniversity,
  inviteUniversityAdmin,
} from '../controllers/universityController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

// University Registration Route (Only PlatformAdmins)
router.post(
  '/register',
  authenticateJWT,
  authorizeRoles(['PlatformAdmin']),
  [
    body('name').notEmpty().trim().escape().withMessage('University name is required'),
    body('domain').isURL().withMessage('Enter a valid domain URL'),
    body('accreditationDetails').optional().trim().escape(),
  ],
  asyncHandler(registerUniversity)
);

// Invite University Admin Route (Only PlatformAdmins)
router.post(
  '/invite-admin',
  authenticateJWT,
  authorizeRoles(['PlatformAdmin']),
  [
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email'),
    body('universityId').isInt().withMessage('Valid university ID is required'),
  ],
  asyncHandler(inviteUniversityAdmin)
);

export default router;
