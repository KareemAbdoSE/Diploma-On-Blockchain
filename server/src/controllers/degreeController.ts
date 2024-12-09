// src/controllers/degreeController.ts

import { Request, Response } from 'express';
import { Degree, DegreeCreationAttributes } from '../models/Degree';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import University from '../models/University';
import csv from 'csv-parser';
import stream from 'stream';

/**
 * Upload a single degree without file upload.
 * University Admins only.
 */
export const uploadDegree = async (req: Request, res: Response) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { degreeType, major, graduationDate, studentEmail } = req.body;
  const universityAdminId = req.user?.userId;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin along with their associated university
    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Validate email domain
    const emailDomain = studentEmail.substring(studentEmail.indexOf('@')).toLowerCase();
    const universityDomain = universityAdmin.university!.domain.toLowerCase();

    if (emailDomain !== universityDomain) {
      return res.status(400).json({ message: 'Student email domain does not match university domain' });
    }

    // Create a new degree entry with status 'draft'
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

/**
 * Bulk upload degrees with CSV file.
 * University Admins only.
 */
export const bulkUploadDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin along with their associated university
    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({
        message: 'University admin not associated with a university',
      });
    }

    const universityId = universityAdmin.universityId;

    // Ensure a CSV file is provided
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const degrees: DegreeCreationAttributes[] = [];
    const errors: any[] = [];
    const emailsSet = new Set<string>();

    const parser = csv();

    // Create a readable stream from the uploaded file buffer
    const readable = new stream.Readable();
    readable._read = () => {}; // _read is required but you can noop it
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

        // Validate required fields
        if (!degreeType || !major || !graduationDate || !studentEmail) {
          errors.push({
            row: row,
            error: 'Missing required fields',
          });
          return;
        }

        // Validate email domain
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

        // Check for duplicate emails in the upload
        if (emailsSet.has(emailLower)) {
          errors.push({
            row: row,
            error: 'Duplicate email in upload',
          });
          return;
        }
        emailsSet.add(emailLower);

        // Prepare degree data
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
        // If there are errors during CSV parsing, return them
        if (errors.length > 0) {
          return res.status(400).json({
            message: 'Errors occurred during CSV processing',
            errors,
          });
        }

        // Bulk create degrees in the database
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

/**
 * Revert degrees from 'pending_confirmation' back to 'draft'.
 * University Admins only.
 */
export const revertDegreesConfirmation = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const { degreeIds } = req.body;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin
    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({
        message: 'University admin not associated with a university',
      });
    }

    const universityId = universityAdmin.universityId;

    // Validate degreeIds
    if (!Array.isArray(degreeIds) || degreeIds.length === 0) {
      return res.status(400).json({ message: 'No degrees selected for reverting' });
    }

    // Fetch degrees to revert
    const degrees = await Degree.findAll({
      where: {
        id: degreeIds,
        universityId: universityId,
        status: 'pending_confirmation',
      },
    });

    // Check if all degrees are found and in correct status
    if (degrees.length !== degreeIds.length) {
      return res.status(400).json({
        message: 'Some degrees were not found or not in pending_confirmation status',
      });
    }

    // Revert each degree's status to 'draft'
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

/**
 * List all draft degrees.
 * University Admins only.
 */
export const listDraftDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin
    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Fetch degrees with status 'draft'
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

/**
 * Confirm degrees in two steps.
 * University Admins only.
 */
export const confirmDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const { degreeIds, confirmationStep } = req.body;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin
    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({
        message: 'University admin not associated with a university',
      });
    }

    const universityId = universityAdmin.universityId;

    // Validate degreeIds
    if (!Array.isArray(degreeIds) || degreeIds.length === 0) {
      return res.status(400).json({ message: 'No degrees selected for confirmation' });
    }

    // Fetch degrees to confirm
    const degrees = await Degree.findAll({
      where: {
        id: degreeIds,
        universityId: universityId,
      },
    });

    // Check if all degrees are found
    if (degrees.length !== degreeIds.length) {
      return res.status(400).json({
        message: 'Some degrees not found or not belonging to your university',
      });
    }

    if (confirmationStep === 1) {
      // First step: Change status from 'draft' to 'pending_confirmation'
      for (const degree of degrees) {
        if (degree.status !== 'draft') {
          return res.status(400).json({
            message: 'Only draft degrees can be confirmed in the first step',
          });
        }
        degree.status = 'pending_confirmation';
        await degree.save();
      }
      return res.status(200).json({
        message: 'Degrees marked for confirmation. Confirm again to finalize.',
      });
    } else if (confirmationStep === 2) {
      // Second step: Change status from 'pending_confirmation' to 'submitted'
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

/**
 * List all degrees for the university.
 * University Admins only.
 */
export const listDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin along with their associated university
    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Fetch all degrees for the university, including user details
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

/**
 * Fetch multiple degrees by their IDs.
 * University Admins only.
 */
export const getMultipleDegrees = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const { degreeIds } = req.body;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin
    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({
        message: 'University admin not associated with a university',
      });
    }

    const universityId = universityAdmin.universityId;

    // Fetch degrees by IDs and ensure they belong to the university
    const degrees = await Degree.findAll({
      where: {
        id: degreeIds,
        universityId: universityId,
      },
    });

    // Check if all degrees are found
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

/**
 * Update a degree.
 * University Admins only.
 */
export const updateDegree = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const degreeId = req.params.id;
  const { degreeType, major, graduationDate, studentEmail } = req.body;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin along with their associated university
    const universityAdmin = await User.findByPk(universityAdminId, {
      include: [University],
    });

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Fetch the degree to update
    const degree = await Degree.findOne({
      where: {
        id: degreeId,
        universityId: universityId,
      },
    });

    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }

    // Only allow updates to degrees in 'draft' status
    if (degree.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot update non-draft degree' });
    }

    // If studentEmail is provided, validate its domain
    if (studentEmail) {
      const emailDomain = studentEmail.substring(studentEmail.indexOf('@')).toLowerCase();
      const universityDomain = universityAdmin.university!.domain.toLowerCase();

      if (emailDomain !== universityDomain) {
        return res.status(400).json({ message: 'Student email domain mismatch' });
      }

      degree.studentEmail = studentEmail.toLowerCase();
    }

    // Update other fields if provided
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

/**
 * Delete a degree.
 * University Admins only.
 */
export const deleteDegree = async (req: Request, res: Response) => {
  const universityAdminId = req.user?.userId;
  const degreeId = req.params.id;

  try {
    // Check if the user is authenticated
    if (!universityAdminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the university admin
    const universityAdmin = await User.findByPk(universityAdminId);

    if (!universityAdmin || !universityAdmin.universityId) {
      return res.status(400).json({ message: 'University admin not associated with a university' });
    }

    const universityId = universityAdmin.universityId;

    // Fetch the degree to delete
    const degree = await Degree.findOne({
      where: {
        id: degreeId,
        universityId: universityId,
      },
    });

    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }

    // Only allow deletion of degrees in 'draft' status
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

/**
 * List all available degrees to claim for students.
 * Students only.
 */
export const listAvailableDegreesToClaim = async (req: Request, res: Response) => {
  const studentId = req.user?.userId;

  try {
    // Check if the user is authenticated
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the student along with their associated university
    const student = await User.findByPk(studentId, {
      include: [University],
    });

    if (!student || !student.universityId) {
      return res.status(400).json({ message: 'Student not associated with any university' });
    }

    const universityId = student.universityId;
    const studentEmail = student.email.toLowerCase();

    // Fetch degrees that are 'submitted' and ready to be claimed by the student
    const degrees = await Degree.findAll({
      where: {
        universityId: universityId,
        studentEmail: studentEmail,
        status: 'submitted', // Degrees that are ready to be claimed
      },
      include: [
        {
          model: University,
          attributes: ['name'],
        },
      ],
    });

    return res.status(200).json({ degrees });
  } catch (error) {
    console.error('Error fetching available degrees:', error);
    return res.status(500).json({ message: 'Error fetching available degrees', error });
  }
};
