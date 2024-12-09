// src/controllers/universityController.ts

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import University, { UniversityCreationAttributes } from '../models/University';
import InvitationToken from '../models/InvitationToken';
import crypto from 'crypto';
import transporter from '../config/emailConfig';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Role } from '../models/Role';

/**
 * Register a new university.
 * Platform Admins only.
 */
export const registerUniversity = async (req: Request, res: Response) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, domain, accreditationDetails } = req.body;

  try {
    // Check if the university already exists
    const existingUniversity = await University.findOne({ where: { name } });
    if (existingUniversity) {
      return res.status(400).json({ message: 'University already registered.' });
    }

    // Prepare university data
    const universityData: UniversityCreationAttributes = {
      name,
      domain,
      isVerified: true, // Automatically verify the university upon registration
    };

    if (accreditationDetails) {
      universityData.accreditationDetails = accreditationDetails;
    }

    // Create the university
    const university = await University.create(universityData);

    return res.status(201).json({
      message: 'University registered and verified successfully.',
      universityId: university.id,
    });
  } catch (error) {
    console.error('Error registering university:', error);
    return res.status(500).json({ message: 'Error registering university', error });
  }
};

/**
 * Invite a University Admin via email.
 * Platform Admins only.
 */
export const inviteUniversityAdmin = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, universityId } = req.body;

  try {
    // Fetch the university to ensure it exists and is verified
    const university = await University.findByPk(universityId);

    if (!university || !university.isVerified) {
      return res.status(400).json({ message: 'University not found or not verified.' });
    }

    // Generate a unique invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    await InvitationToken.create({
      universityId,
      email,
      token: invitationToken,
      expiresAt: new Date(Date.now() + 3600000), // Token expires in 1 hour
    });

    // Construct the invitation URL
    const invitationUrl = `${process.env.FRONTEND_URL}/register-university-admin?token=${invitationToken}`;

    // Send the invitation email
    await transporter.sendMail({
      to: email,
      subject: 'University Admin Invitation',
      html: `<p>You have been invited to register as a University Admin for <strong>${university.name}</strong>. Please register by clicking on the following link:</p>
             <p><a href="${invitationUrl}">${invitationUrl}</a></p>
             <p>This link will expire in 1 hour.</p>`,
    });

    return res.status(200).json({ message: 'Invitation sent successfully.' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return res.status(500).json({ message: 'Error sending invitation', error });
  }
};

/**
 * Get all verified universities.
 * Public Endpoint.
 */
export const getVerifiedUniversities = async (req: Request, res: Response) => {
  try {
    const universities = await University.findAll({
      where: { isVerified: true },
      attributes: ['id', 'name', 'domain', 'accreditationDetails'],
    });

    return res.status(200).json({ universities });
  } catch (error) {
    console.error('Error fetching universities:', error);
    return res.status(500).json({ message: 'Error fetching universities', error });
  }
};
