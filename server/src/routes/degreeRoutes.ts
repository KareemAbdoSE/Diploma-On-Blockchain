import express from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import {
  uploadDegree,
  bulkUploadDegrees,
  listDraftDegrees,
  listDegrees,
  updateDegree,
  confirmDegrees,
  deleteDegree,
} from '../controllers/degreeController';
import { body } from 'express-validator';
import asyncHandler from '../utils/asyncHandler';
import multer from 'multer';
const uploadCSV = multer();

const router = express.Router();

// Upload single degree (University Admins only)
router.post(
  '/upload',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  upload.single('degreeFile'),
  [
    body('degreeType').notEmpty().withMessage('Degree type is required'),
    body('major').notEmpty().withMessage('Major is required'),
    body('graduationDate').isISO8601().withMessage('Graduation date is required and must be a valid date'),
    body('studentEmail').isEmail().withMessage('Valid student email is required'),
  ],
  asyncHandler(uploadDegree)
);

// Bulk upload degrees (University Admins only)
router.post(
  '/bulk-upload',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  uploadCSV.single('file'),
  asyncHandler(bulkUploadDegrees)
);

// List draft degrees (University Admins only)
router.get(
  '/drafts',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  asyncHandler(listDraftDegrees)
);

// List all degrees (University Admins only)
router.get(
  '/',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  asyncHandler(listDegrees)
);

// Update degree (University Admins only)
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  [
    body('degreeType').optional().notEmpty().withMessage('Degree type must not be empty'),
    body('major').optional().notEmpty().withMessage('Major must not be empty'),
    body('graduationDate').optional().isISO8601().withMessage('Graduation date must be a valid date'),
    body('studentEmail').optional().isEmail().withMessage('Valid student email is required'),
  ],
  asyncHandler(updateDegree)
);

// Delete degree (University Admins only)
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  asyncHandler(deleteDegree)
);

// Confirm degrees (University Admins only)
router.post(
  '/confirm',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  [
    body('degreeIds').isArray({ min: 1 }).withMessage('Degree IDs must be an array with at least one ID'),
    body('confirmationStep').isInt({ min: 1, max: 2 }).withMessage('Confirmation step must be 1 or 2'),
  ],
  asyncHandler(confirmDegrees)
);

export default router;
