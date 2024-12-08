// src/controllers/degreeController.ts

import { Request, Response } from 'express';
import { Degree, DegreeCreationAttributes } from '../models/Degree';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import University from '../models/University';
import csv from 'csv-parser';
import stream from 'stream';

export const uploadDegree = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { degreeType, major, graduationDate, studentEmail } = req.body;
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

    const universityId = universityAdmin.universityId;

    const emailDomain = studentEmail.substring(studentEmail.indexOf('@')).toLowerCase();
    const universityDomain = universityAdmin.university!.domain.toLowerCase();

    if (emailDomain !== universityDomain) {
      return res.status(400).json({ message: 'Student email domain does not match university domain' });
    }

    const degree = await Degree.create({
      universityId: universityId,
      degreeType,
      major,
      graduationDate,
      studentEmail: studentEmail.toLowerCase(),
      status: 'draft',
    } as DegreeCreationAttributes);

    return res.status(201).json({ message: 'Degree uploaded successfully', degree });
  } catch (error) {
    console.error('Error uploading degree:', error);
    return res.status(500).json({ message: 'Error uploading degree', error });
  }
};

export const bulkUploadDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({
        message: 'University admin not associated with a university',
      });
    }

    const universityId = universityAdmin.universityId;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const degrees: DegreeCreationAttributes[] = [];
    const errors: any[] = [];
    const emailsSet = new Set<string>();

    const parser = csv();

    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(req.file.buffer);
    readable.push(null);

    readable
      .pipe(parser)
      .on('data', (row) => {
        const {
          degreeType,
          major,
          graduationDate,
          studentEmail,
        } = row;

        if (!degreeType || !major || !graduationDate || !studentEmail) {
          errors.push({
            row: row,
            error: 'Missing required fields',
          });
          return;
        }

        const emailDomain = studentEmail.substring(studentEmail.indexOf('@')).toLowerCase();
        const universityDomain = universityAdmin.university!.domain.toLowerCase();

        if (emailDomain !== universityDomain) {
          errors.push({
            row: row,
            error: 'Email domain does not match university domain',
          });
          return;
        }

        const emailLower = studentEmail.toLowerCase();
        if (emailsSet.has(emailLower)) {
          errors.push({
            row: row,
            error: 'Duplicate email in upload',
          });
          return;
        }
        emailsSet.add(emailLower);

        degrees.push({
          universityId: universityId,
          degreeType,
          major,
          graduationDate: new Date(graduationDate),
          studentEmail: emailLower,
          status: 'draft',
        });
      })
      .on('end', async () => {
        if (errors.length > 0) {
          return res.status(400).json({
            message: 'Errors occurred during CSV processing',
            errors,
          });
        }

        await Degree.bulkCreate(degrees);

        return res.status(201).json({
          message: 'File uploaded successfully. Degrees saved as drafts.',
          draftDegreesCount: degrees.length,
        });
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        return res.status(500).json({ message: 'Error parsing CSV file' });
      });
  } catch (error) {
    console.error('Error during bulk upload:', error);
    return res.status(500).json({ message: 'Error during bulk upload', error });
  }
};

export const revertDegreesConfirmation = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const { degreeIds } = req.body;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({
        message: 'University admin not associated with a university',
      });
    }

    const universityId = universityAdmin.universityId;

    if (!Array.isArray(degreeIds) || degreeIds.length === 0) {
      return res.status(400).json({ message: 'No degrees selected for reverting' });
    }

    const degrees = await Degree.findAll({
      where: {
        id: degreeIds,
        universityId: universityId,
        status: 'pending_confirmation',
      },
    });

    if (degrees.length !== degreeIds.length) {
      return res.status(400).json({
        message: 'Some degrees were not found or not in pending_confirmation status',
      });
    }

    for (const degree of degrees) {
      degree.status = 'draft';
      await degree.save();
    }

    return res.status(200).json({ message: 'Degrees reverted to draft status.' });
  } catch (error) {
    console.error('Error reverting degrees confirmation:', error);
    return res.status(500).json({ message: 'Error reverting degrees confirmation', error });
  }
};

export const listDraftDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    const degrees = await Degree.findAll({
      where: {
        universityId: universityId,
        status: 'draft',
      },
    });

    return res.status(200).json({ degrees });
  } catch (error) {
    console.error('Error listing draft degrees:', error);
    return res.status(500).json({ message: 'Error listing draft degrees', error });
  }
};

export const confirmDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const { degreeIds, confirmationStep } = req.body;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({
        message: 'University admin not associated with a university',
      });
    }

    const universityId = universityAdmin.universityId;

    if (!Array.isArray(degreeIds) || degreeIds.length === 0) {
      return res.status(400).json({ message: 'No degrees selected for confirmation' });
    }

    const degrees = await Degree.findAll({
      where: {
        id: degreeIds,
        universityId: universityId,
      },
    });

    if (degrees.length !== degreeIds.length) {
      return res.status(400).json({
        message: 'Some degrees not found or not belonging to your university',
      });
    }

    if (confirmationStep === 1) {
      for (const degree of degrees) {
        if (degree.status !== 'draft') {
          return res.status(400).json({
            message: 'Only draft degrees can be confirmed first step',
          });
        }
        degree.status = 'pending_confirmation';
        await degree.save();
      }
      return res.status(200).json({
        message: 'Degrees marked for confirmation. Confirm again to finalize.',
      });
    } else if (confirmationStep === 2) {
      for (const degree of degrees) {
        if (degree.status !== 'pending_confirmation') {
          return res.status(400).json({
            message: 'Degrees must be pending_confirmation for final confirmation',
          });
        }
        degree.status = 'submitted';
        await degree.save();
      }
      return res.status(200).json({ message: 'Degrees submitted successfully.' });
    } else {
      return res.status(400).json({ message: 'Invalid confirmation step' });
    }
  } catch (error) {
    console.error('Error confirming degrees:', error);
    return res.status(500).json({ message: 'Error confirming degrees', error });
  }
};

export const listDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    const degrees = await Degree.findAll({
      where: {
        universityId: universityId,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'email'],
        },
      ],
    });

    return res.status(200).json({ degrees });
  } catch (error) {
    console.error('Error listing degrees:', error);
    return res.status(500).json({ message: 'Error listing degrees', error });
  }
};

export const getMultipleDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const { degreeIds } = req.body;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({
        message: 'University admin not associated with a university',
      });
    }

    const universityId = universityAdmin.universityId;

    const degrees = await Degree.findAll({
      where: {
        id: degreeIds,
        universityId: universityId,
      },
    });

    if (degrees.length !== degreeIds.length) {
      return res.status(400).json({
        message: 'Some degrees not found or not belonging to your university',
      });
    }

    return res.status(200).json({ degrees });
  } catch (error) {
    console.error('Error fetching degrees:', error);
    return res.status(500).json({ message: 'Error fetching degrees', error });
  }
};

export const updateDegree = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const degreeId = req.params.id;
  const { degreeType, major, graduationDate, studentEmail } = req.body;

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

    const universityId = universityAdmin.universityId;

    const degree = await Degree.findOne({
      where: {
        id: degreeId,
        universityId: universityId,
      },
    });

    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }

    if (degree.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot update non-draft degree' });
    }

    if (studentEmail) {
      const emailDomain = studentEmail.substring(studentEmail.indexOf('@')).toLowerCase();
      const universityDomain = universityAdmin.university!.domain.toLowerCase();

      if (emailDomain !== universityDomain) {
        return res.status(400).json({ message: 'Student email domain mismatch' });
      }

      degree.studentEmail = studentEmail.toLowerCase();
    }

    degree.degreeType = degreeType || degree.degreeType;
    degree.major = major || degree.major;
    degree.graduationDate = graduationDate ? new Date(graduationDate) : degree.graduationDate;

    await degree.save();

    return res.status(200).json({ message: 'Degree updated successfully', degree });
  } catch (error) {
    console.error('Error updating degree:', error);
    return res.status(500).json({ message: 'Error updating degree', error });
  }
};

export const deleteDegree = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const degreeId = req.params.id;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    const degree = await Degree.findOne({
      where: {
        id: degreeId,
        universityId: universityId,
      },
    });

    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }

    if (degree.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot delete non-draft degree' });
    }

    await degree.destroy();

    return res.status(200).json({ message: 'Degree deleted successfully' });
  } catch (error) {
    console.error('Error deleting degree:', error);
    return res.status(500).json({ message: 'Error deleting degree', error });
  }
};
