import { Request, Response } from 'express';
import { Degree, DegreeCreationAttributes } from '../models/Degree';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import University from '../models/University';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import csv from 'csv-parser';
import stream from 'stream';
import transporter from '../config/emailConfig';

// Upload Degree (Single Entry)
export const uploadDegree = async (req: Request, res: Response) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there was a file uploaded, delete it
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { degreeType, major, graduationDate, studentEmail } = req.body;
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      // If there was a file uploaded, delete it
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get university admin's university
    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      // If there was a file uploaded, delete it
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Check that the student email matches the university domain
    const emailDomain = studentEmail.substring(studentEmail.indexOf('@')).toLowerCase(); // Includes '@'
    const universityDomain = universityAdmin.university!.domain.toLowerCase(); // Already includes '@'

    if (emailDomain !== universityDomain) {
      // If there was a file uploaded, delete it
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Student email domain does not match university domain' });
    }

    // Create new Degree with status 'draft'
    const degree = await Degree.create({
      universityId: universityId,
      degreeType,
      major,
      graduationDate,
      studentEmail: studentEmail.toLowerCase(),
      status: 'draft',
      filePath: req.file?.path, // Use optional chaining
    } as DegreeCreationAttributes);

    return res.status(201).json({ message: 'Degree uploaded successfully', degree });
  } catch (error) {
    // If there was a file uploaded, delete it
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading degree:', error);
    return res.status(500).json({ message: 'Error uploading degree', error });
  }
};

// Bulk Upload Degrees
export const bulkUploadDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get university admin's university
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
    readable._read = () => {}; // _read is required but you can noop it
    readable.push(req.file.buffer);
    readable.push(null);

    readable
      .pipe(parser)
      .on('data', (row) => {
        // Validate each row
        const {
          degreeType,
          major,
          graduationDate,
          studentEmail,
        } = row;

        // Check required fields
        if (!degreeType || !major || !graduationDate || !studentEmail) {
          errors.push({
            row: row,
            error: 'Missing required fields',
          });
          return;
        }

        // Validate email
        const emailDomain = studentEmail.substring(studentEmail.indexOf('@')).toLowerCase(); // Includes '@'
        const universityDomain = universityAdmin.university!.domain.toLowerCase(); // Already includes '@'

        if (emailDomain !== universityDomain) {
          errors.push({
            row: row,
            error: 'Email domain does not match university domain',
          });
          return;
        }

        // Check for duplicate emails in the same upload
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

        // Save degrees in bulk
        await Degree.bulkCreate(degrees);

        return res.status(201).json({
          message:
            'File uploaded successfully. Degrees saved as drafts.',
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

// List Draft Degrees
export const listDraftDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get university admin's university
    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Get draft degrees for this university
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

// Confirm Degrees (Double Confirmation)
export const confirmDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const { degreeIds, confirmationStep } = req.body; // degreeIds is an array of degree IDs

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get university admin's university
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

    // Find the degrees
    const degrees = await Degree.findAll({
      where: {
        id: degreeIds,
        universityId: universityId,
      },
    });

    if (degrees.length !== degreeIds.length) {
      return res.status(400).json({
        message: 'Some degrees were not found or do not belong to your university',
      });
    }

    // Update the degrees' status based on the confirmation step
    if (confirmationStep === 1) {
      // First confirmation, change status to 'pending_confirmation'
      for (const degree of degrees) {
        if (degree.status !== 'draft') {
          return res.status(400).json({
            message: 'Only degrees in draft status can be confirmed',
          });
        }
        degree.status = 'pending_confirmation';
        await degree.save();
      }
      return res.status(200).json({
        message:
          'Degrees marked for confirmation. Please confirm again to finalize.',
      });
    } else if (confirmationStep === 2) {
      // Second confirmation, change status to 'submitted'
      for (const degree of degrees) {
        if (degree.status !== 'pending_confirmation') {
          return res.status(400).json({
            message:
              'Degrees must be pending confirmation for final confirmation',
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

// List Degrees (All statuses)
export const listDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get university admin's university
    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Get all degrees for this university
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

// Update Degree
export const updateDegree = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const degreeId = req.params.id;
  const { degreeType, major, graduationDate, studentEmail } = req.body;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get university admin's university
    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Find the degree
    const degree = await Degree.findOne({
      where: {
        id: degreeId,
        universityId: universityId,
      },
    });

    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }

    // Only allow updates if the degree is in 'draft' status
    if (degree.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot update a degree that is not in draft status' });
    }

    // Check that the student email matches the university domain
    if (studentEmail) {
      const emailDomain = studentEmail.substring(studentEmail.indexOf('@')).toLowerCase(); // Includes '@'
      const universityDomain = universityAdmin.university!.domain.toLowerCase(); // Already includes '@'

      if (emailDomain !== universityDomain) {
        return res.status(400).json({ message: 'Student email domain does not match university domain' });
      }

      degree.studentEmail = studentEmail.toLowerCase();
    }

    // Update the degree
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

// Delete Degree
export const deleteDegree = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const degreeId = req.params.id;

  try {
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get university admin's university
    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Find the degree
    const degree = await Degree.findOne({
      where: {
        id: degreeId,
        universityId: universityId,
      },
    });

    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }

    // Only allow deletion if the degree is in 'draft' status
    if (degree.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot delete a degree that is not in draft status' });
    }

    // Delete the degree file if exists
    if (degree.filePath && fs.existsSync(degree.filePath)) {
      fs.unlinkSync(degree.filePath);
    }

    await degree.destroy();

    return res.status(200).json({ message: 'Degree deleted successfully' });
  } catch (error) {
    console.error('Error deleting degree:', error);
    return res.status(500).json({ message: 'Error deleting degree', error });
  }
};
