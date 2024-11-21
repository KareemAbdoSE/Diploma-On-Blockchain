// src/routes/universityRoutes.ts
import express from 'express';
import { body } from 'express-validator';
import {
  registerUniversity,
  inviteUniversityAdmin, getVerifiedUniversities,
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
    body('domain')
      .matches(/^@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/)
      .withMessage('Enter a valid domain starting with "@" (e.g., @example.com)'),
    body('accreditationDetails').optional().trim().escape(),
  ],
  asyncHandler(registerUniversity)
);


// Get Verified Universities (Public Endpoint)
router.get('/verified', asyncHandler(getVerifiedUniversities));

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
