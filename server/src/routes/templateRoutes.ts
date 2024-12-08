// src/routes/templateRoutes.ts

import express from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import multer from 'multer';
import { uploadTemplate, getTemplates, updateTemplate } from '../controllers/templateController';
import { body } from 'express-validator';
import asyncHandler from '../utils/asyncHandler';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Template from '../models/Template';
import fs from 'fs';
import { Request, Response } from 'express';

const router = express.Router();

// Configure multer storage with unique filenames
const storage = multer.diskStorage({
  destination: process.env.UPLOADS_DIR || 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Initialize multer with storage, file size limit, and file type filter
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPG are allowed.'));
    }
  },
});

// Upload template (University Admins only)
router.post(
  '/upload',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  upload.single('templateFile'),
  [body('templateName').notEmpty().withMessage('Template name is required')],
  asyncHandler(uploadTemplate)
);

// Get all templates (University Admins only)
router.get(
  '/',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  asyncHandler(getTemplates)
);

// Update template (University Admins only)
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  upload.single('templateFile'),
  [body('templateName').optional().notEmpty().withMessage('Template name is required')],
  asyncHandler(updateTemplate)
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles(['UniversityAdmin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // template ID
    const userId = req.user?.userId;

    try {
      const template = await Template.findOne({ where: { id } });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      // Remove the file if it exists
      if (fs.existsSync(template.filePath)) {
        fs.unlinkSync(template.filePath);
      }

      await Template.destroy({ where: { id } });
      return res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      return res.status(500).json({
        message: 'Error deleting template',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

export default router;
