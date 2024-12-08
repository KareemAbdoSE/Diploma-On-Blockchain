import { Request, Response } from 'express';
import { Template } from '../models/Template';
import { User } from '../models/User';
import University from '../models/University';
import fs from 'fs';
import { validationResult } from 'express-validator';

export const uploadTemplate = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { templateName } = req.body;
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Template file is required' });
    }

    const template = await Template.create({
      universityId: universityAdmin.universityId,
      templateName,
      filePath: req.file.path,
    });

    return res.status(201).json({ message: 'Template uploaded successfully', template });
  } catch (error) {
    return res.status(500).json({
      message: 'Error uploading template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const templates = await Template.findAll({
      where: {
        universityId: universityAdmin.universityId,
      },
    });

    return res.status(200).json({ templates });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching templates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  const { id } = req.params; // template ID
  const { templateName } = req.body;
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const template = await Template.findOne({
      where: {
        id,
        universityId: universityAdmin.universityId,
      },
    });

    if (!template) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Template not found' });
    }

    if (req.file && req.file.path) {
      // Remove the old file
      if (template.filePath && fs.existsSync(template.filePath)) {
        fs.unlinkSync(template.filePath);
      }
      template.filePath = req.file.path;
    }

    if (templateName) {
      template.templateName = templateName;
    }

    await template.save();

    return res.status(200).json({ message: 'Template updated successfully', template });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
