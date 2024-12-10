// src/controllers/universityController.ts

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import University from '../models/University';
import InvitationToken from '../models/InvitationToken';
import crypto from 'crypto';
import transporter from '../config/emailConfig';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Role } from '../models/Role';

/**
 * Get all verified universities and include information about
 * whether a UniversityAdmin has signed up, their email, and their signup time.
 */
export const getVerifiedUniversities = async (req: Request, res: Response) => {
  try {
    const universityAdminRole = await Role.findOne({ where: { name: 'UniversityAdmin' } });
    if (!universityAdminRole) {
      return res.status(500).json({ message: 'UniversityAdmin role not found' });
    }

    const universities = await University.findAll({
      where: { isVerified: true },
      attributes: ['id', 'name', 'domain', 'accreditationDetails', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['email', 'createdAt'],
          include: [
            {
              model: Role,
              attributes: ['name'],
              where: { name: 'UniversityAdmin' },
              required: false,
            },
          ],
          required: false,
        },
      ],
    });

    const transformed = universities.map((uni) => {
      const adminUser = uni.users.find((u) => u.role && u.role.name === 'UniversityAdmin');
      return {
        id: uni.id,
        name: uni.name,
        domain: uni.domain,
        accreditationDetails: uni.accreditationDetails,
        createdAt: uni.createdAt,
        updatedAt: uni.updatedAt,
        adminAssigned: !!adminUser,
        adminEmail: adminUser ? adminUser.email : null,
        adminAssignedAt: adminUser ? adminUser.createdAt : null,
      };
    });

    return res.status(200).json({ universities: transformed });
  } catch (error) {
    console.error('Error fetching universities:', error);
    return res.status(500).json({ message: 'Error fetching universities', error });
  }
};

/**
 * Register a new university (no changes here, shown for completeness)
 */
export const registerUniversity = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, domain, accreditationDetails } = req.body;

  try {
    const existingUniversity = await University.findOne({ where: { name } });
    if (existingUniversity) {
      return res.status(400).json({ message: 'University already registered.' });
    }

    const universityData: any = {
      name,
      domain,
      isVerified: true,
    };

    if (accreditationDetails) {
      universityData.accreditationDetails = accreditationDetails;
    }

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
 * Invite a University Admin (no changes needed here beyond existing code)
 */
export const inviteUniversityAdmin = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, universityId } = req.body;

  try {
    const university = await University.findByPk(universityId);

    if (!university || !university.isVerified) {
      return res.status(400).json({ message: 'University not found or not verified.' });
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');
    await InvitationToken.create({
      universityId,
      email,
      token: invitationToken,
      expiresAt: new Date(Date.now() + 3600000),
    });

    const invitationUrl = `${process.env.FRONTEND_URL}/register-university-admin?token=${invitationToken}`;

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


