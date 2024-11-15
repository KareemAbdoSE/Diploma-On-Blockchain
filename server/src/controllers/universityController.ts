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

    const universityData: UniversityCreationAttributes = {
      name,
      domain,
      isVerified: false,
    };

    if (accreditationDetails) {
      universityData.accreditationDetails = accreditationDetails;
    }

    const university = await University.create(universityData);

    return res.status(201).json({
      message: 'University registered successfully. Awaiting verification.',
      universityId: university.id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering university', error });
  }
};

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
      html: `<p>You have been invited to register as a University Admin for ${university.name}. Please register by clicking on the following link: <a href="${invitationUrl}">${invitationUrl}</a></p>`,
    });

    return res.status(200).json({ message: 'Invitation sent successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error sending invitation', error });
  }
};
